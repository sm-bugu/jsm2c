'use strict';
var JSFile = require('./lib/core/jsFile.js');
var HtmlFile = require('./lib/core/htmlFile.js');
var _ = require('./lib/util.js');
var config = require('./lib/config.js');
var fcHandler = require('./lib/core/fcHandler.js');

module.exports = {
    setConfig: function (conf) {
        config.merge(conf);
    },
    setGetContentHandler: function (func) {
        fcHandler.setHandler(func);
    },
    parse: function (src, conf) {
        var file;

        this.setConfig(conf);

        if (_.isJS(src)) {
            file = new JSFile(src);

        } else if (_.isHtml(src)) {
            file = new HtmlFile(src);
        }
        if (file) {
            file.parse();
            return file.getContent();
        }
        return false;
    }
};
