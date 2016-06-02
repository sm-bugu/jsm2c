'use strict';
var _ = require('../util.js');
var config = require('../config.js');
var File = require('./file.js');
var JSFile = require('./jsFile.js');
var util = require('util');
var storage = require('./storage.js');

function HtmlFile(src, based) {
    File.call(this, src, based);
}
var prototype = {
    parse: function () {
        var scriptRegExp = /<(script) .*?data-main.*?>([\s\S]*?)<\/\1>/mig,
            self = this;

        (function (file) {
            var content = self.getContent(),
                deps,
                count = 0;

            content = content.toString();

            content = content.replace(scriptRegExp, function () {
                var sContent = arguments[2],
                    nContent = '',
                    newFilename = '.' + self.basename + 'fragment_' + (count++) + '.js',
                    newPath = self.dirname + '/' + newFilename,
                    rFile;

                _.write(newPath, sContent);
                rFile = new JSFile(newPath, self.dirname, true);
                deps = rFile.parse(true);
                if (Array.isArray(deps)) {
                    for (var i = 0, dep, len = deps.length; i < len; i++) {
                        dep = self.root + '/' + deps[i];
                        nContent += self.buildTag(new File(dep, self.dirname));
                    }
                    sContent = rFile.getContent();
                    if (sContent.replace(/[\s;,]/gm, '')) {
                        nContent += '<script' + ' type="text/javascript">\n' + sContent() + '\n</' + 'script>';
                    }
                }
                storage.del(rFile.subpath);
                if (_.exists(newPath)) {
                    _.fs.unlinkSync(newPath);
                }
                return nContent;
            });
            self.setContent(content);
        })(this);
    },
    buildTag: function (file) {
        var ext = file.ext;

        return config.get(['tmpl', ext]).replace(/\{\d{1}\}/, file.relativePath) + '\n\t';
    }
};

util.inherits(HtmlFile, File);

_.merge(HtmlFile.prototype, prototype);

module.exports = HtmlFile;

