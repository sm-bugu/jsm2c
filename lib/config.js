'use strict';

var Immutable = require('immutable');

var config = Immutable.fromJS({

    // 生成闭包的命名空间
    ns: 'ns',

    // 项目的根目录
    root: process.cwd(),

    // 分析的文件是否是被压缩过的文件
    compress: false,

    // js文件中的出现require()的路径是否是基于root的（主要用于应对使用构建工具生成的文件，路径会被编译为基于项目root的相对路径，如fis）
    fileBasedRoot: false,

    // 是否对html中的js代码添加闭包代码, 如果代码中的require参与运算的话，就忽略该值，为代码加上闭包。
    wrapJsInHtml: false,

    error: 'throw',
    tmpl: {
        js: '<script type="text/javascript" src="{0}"></script>',
        css: '<link rel="stylesheet" type="text/css" href="{0}">'
    }
});

module.exports = {
    get: function (key) {
        var result = Array.isArray(key) ?
            config.getIn(key) :
            config.get(key);

        if (result && result.toJS) {
            return result.toJS();
        }
        return result;
    },
    set: function (key, value) {
        config = Array.isArray(key) ?
            config.setIn(key, value) :
            config.set(key, value);
    },
    merge: function (conf) {
        config = config.mergeDeep(conf);
    }
};
