'use strict';
var _ = require('../util.js');
var config = require('../config.js');
var log = require('../log.js');
var fcHandler = require('../core/fcHandler.js');

function File(src, parent) {
    var isBasedRoot = config.get('fileBasedRoot'),
        root = config.get('root'),
        realpath;

    this.root = root;
    this.based = _.normalize(isBasedRoot ? root : parent || root);
    realpath = _.normalize(_.path.resolve(this.based, src));
    this.isCheckExists = config.get('exists');
    if (this.isCheckExists && !_.exists(realpath)) {
        log.error('based on`' + this.based + '` unable to find file: ' + realpath);
    }
    this.ns = config.get('ns');
    this.realpath = realpath;
    this.relativePath = parent ? _.normalize(_.path.relative(parent, this.realpath)) : this.realpath;
    this.dirname = _.path.dirname(realpath);
    this.ext = _.extname(realpath);
    this.basename = _.path.basename(realpath, 'js');
    this.filename = _.path.basename(realpath);
    this.subpath = _.normalize(_.path.relative(root, realpath));
    this.deps = [];
    this.adeps = [];
    this.depFiles = {};
    this.id = this.buildId();
}

File.prototype = {

    buildId: function () {
        var src = this.subpath;

        return src.replace(/[:\/\\.-]+/g, '_').replace(/_[^_]+/g, function () {
            var args = [].slice.call(arguments, 0),
                index = args[1],
                v = escape(args[0].replace(/[_]/g, '')).replace(/%[\da-z]{2}/ig, '');

            if (index == 0) {
                return v;
            }
            return '_' + v;
        });
    },

    getContent: function () {
        var content;

        if (typeof this._content === 'undefined') {
            content = fcHandler.getContent(this);

            try {
                if (!content) {
                    content = _.read(this.realpath).toString();
                }
            } catch (e) {
                content = '';
            }
            this._content = content || '';
        }
        return this._content;
    },
    setContent: function (content) {
        this._content = content;
    },
    addRequire: function (file) {
        var id = file.subpath;

        if (id && (id = id.trim())) {
            if (this.deps.indexOf(id) < 0) {
                this.deps.push(id);
                this.depFiles[id] = file;
            }
            return id;
        }
        return false;
    },
    removeRequire: function (file) {
        var id = file.subpath,
            pos = this.deps.indexOf(id);

        if (pos > -1) {
            this.deps.splice(pos, 1);
            delete this.depFiles[id];
        }
    },
    existsRequire: function (id) {
        return this.deps.indexOf(id) >= 0;
    }
};
module.exports = File;
