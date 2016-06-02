'use strict';
var log = require('../log.js');
var _ = require('../util.js');

function RequireStorage() {
    if (RequireStorage.instance instanceof RequireStorage) {
        return this;
    }
    this.storage = {};
}

RequireStorage.prototype = {
    set: function (key, value) {
        this.storage[key] = value;
    },
    get: function (key) {
        return this.storage[key];
    },
    del: function (key) {
        return delete this.storage[key];
    },
    exists: function (key) {
        return key in this.storage;
    },
    analysis: function (key) {
        var storage = this.storage;

        function getDeps(key, map, end) {
            var file = storage[key],
                deps = file.deps;

            map = map || [];

            for (var ci, len = deps.length, tmp, i = len - 1; ci = deps[i], i >= 0; i--) {
                tmp = storage[ci];
                if (tmp && tmp.existsRequire(ci)) {
                    log.error('文件[' + key + ']和文件[' + ci + ']循环引用');
                }
                map.unshift(ci);
                if (_.isJS(ci)) {
                    getDeps(ci, map, i);
                }
            }
            for (var j = 0, ko = {}, cj; cj = map[j]; j++) {
                if (cj in ko) {
                    map.splice(j, 1);
                } else {
                    ko[cj] = true;
                }
            }
            return map;

        }

        return getDeps(key);

    }
};
module.exports = new RequireStorage();

