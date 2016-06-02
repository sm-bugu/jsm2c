'use strict';
var jsm2c = require('./index.js');

jsm2c.setConfig({
    root: '/Users/gml/github/smui-test'

});
var t = jsm2c.parse('/Users/gml/github/smui-test/example/tab/index.html');

console.log(t);

