'use strict';
var config = require('../config.js');
var log = require('../log.js');
var File = require('./file.js');
var util = require('util');
var _ = require('../util.js');
var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');
var esquery = require('esquery');
var Syntax = require('../syntax.js');
var storage = require('./storage.js');

function JSFile(src, based, isTmplJS) {
    File.call(this, src, based);
    this.isTmplJS = isTmplJS;
    this.selectorCache = {
        requireDeclare: {
            selectors: [':function[id.name = "require"]', 'AssignmentExpression[left.name = "require"][right.callee.type = "FunctionExpression"]', 'AssignmentExpression[left.name = "require"][right.type = "FunctionExpression"]'],
            cache: false
        },
        callRequire: {
            selectors: ['CallExpression[callee.name = "require"]'],
            cache: false
        },
        moduleExport: {
            selectors: ['MemberExpression[property.name = "exports"][object.name = "module"]'],
            cache: false
        }
    };
}

JSFile.getAST = function (content) {
    try {
        return esprima.parse(content, {
            loc: true,
            range: true,
            tolerant: true
        });
    } catch (e) {
        log.error(e);
    }
};
function buildMemberExpression(name) {
    var ns = config.get('ns');

    return {
        type: Syntax.MemberExpression,
        computed: false,
        object: {
            type: Syntax.Identifier,
            name: ns
        },
        property: {
            type: Syntax.Identifier,
            name: name
        }
    };
};

var prototype = {
    isExistsNode: function (ast, key) {
        var matches, selectorCache, isFlag = false;

        selectorCache = this.selectorCache[key];

        if (selectorCache.cache) {
            return true;
        }

        for (var i = 0, selector; selector = selectorCache.selectors[i]; i++) {
            try {
                matches = esquery.match(ast, esquery.parse(selector));
                isFlag = matches.length > 0;
            } catch (e) {
                isFlag = false;
            }

            if (isFlag) {
                selectorCache.cache = isFlag;
                return true;
            }
        }

        return isFlag;
    },
    _wrapper: function (ast, exportName) {
        var wrapper = [],
            ns = this.ns,
            wAst;

        exportName = ns + '.' + exportName || this.exportName;

        wrapper.push('(function(' + ns + '){');

        if (exportName && this.isExistsNode(ast, 'moduleExport')) {
            wrapper.push(exportName + ' = ' + exportName + ' || {};');
        }

        wrapper.push('})((window.' + ns + ' = window.' + ns + ' || {}));');

        wAst = JSFile.getAST(wrapper.join(''));

        estraverse.replace(wAst, {
            leave: function (node, parent) {
                var body,
                    item;

                if (node.type === Syntax.BlockStatement && parent.type === Syntax.FunctionExpression && parent.params[0].name === ns) {
                    body = [].slice.call(node.body, 0);
                    item = [].slice.call(ast.body, 0);

                    for (var i = 0, len = item.length; i < len; i++) {
                        body.splice(1 + i, 0, item[i]);
                    }

                    return {
                        type: node.type,
                        body: body
                    };
                }
            }
        });
        return wAst;
    },

    parse: function (isAnalysis) {
        var content = this.getContent(),
            ast, self = this;

        ast = JSFile.getAST(content);
        // 存在require的申明，测跳过该文件
        if (this.isExistsNode(ast, 'requireDeclare')) {
            return false;
        } else if (this.isExistsNode(ast, 'callRequire') || this.isExistsNode(ast, 'moduleExport')) {
            estraverse.replace(ast, {
                leave: function (node, parent) {
                    var nodeType = node.type,
                        requireArgv,
                        requireValue,
                        rFile;

                    if (nodeType === Syntax.CallExpression && node.callee.name === 'require') {
                        requireArgv = node.arguments;
                        // require 没有参数
                        if (requireArgv.length == 0) {
                            log.error('exists no parameter require in the' + self.realpath + 'file');
                        }
                        // require 参数不是String
                        if (requireArgv[0].type !== Syntax.Literal || typeof requireArgv[0].value !== 'string') {
                            log.error('require function accepts only string parameter in the ' + self.realpath);
                        }
                        requireValue = requireArgv[0].value;
                        if (_.isJS(requireValue)) {
                            rFile = new JSFile(requireValue, self.dirname);
                        } else {
                            rFile = new File(requireValue, self.dirname);
                        }
                        self.addRequire(rFile);

                        if (parent.type === Syntax.ExpressionStatement) {
                            return {
                                type: Syntax.EmptyStatement
                            };
                        }
                        return buildMemberExpression(rFile.id);
                    } else if (nodeType == Syntax.MemberExpression && 'name' in node.object && node.object.name === 'module' && 'name' in node.property && node.property.name === 'exports') {
                        self.exportName = self.ns + '.' + self.id;
                        return buildMemberExpression(self.id);
                    }
                }
            });
            if (this.deps.length > 0 || this.exportName) {
                if (!this.isTmplJS) {
                    ast = this._wrapper(ast);
                }
                this._generateContent(ast);
                storage.set(this.subpath, this);
                if (isAnalysis) {
                    if (this.deps.length > 0) {
                        for (var k in this.depFiles) {
                            var depFile = this.depFiles[k];

                            if (_.isJS(depFile.subpath) && !storage.exists(depFile.subpath)) {
                                depFile.parse(isAnalysis);
                            }
                        }
                    }
                    this.adeps = storage.analysis(this.subpath);
                }
                return this.adeps;
            }
        } else {
            return false;
        }
    },
    _generateContent: function (ast) {
        var compress = config.get('compress'),
            escodegenConfig = {},
            content;

        if (compress) {
            escodegenConfig = {
                format: {
                    indent: {
                        style: '',
                        base: 0
                    },
                    compact: true,
                    newLine: ''
                }
            };
        }
        content = escodegen.generate(ast, escodegenConfig);
        this.setContent(content);
    }
};

util.inherits(JSFile, File);

_.merge(JSFile.prototype, prototype);

module.exports = JSFile;

