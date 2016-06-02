'use strict';

module.exports = {
    getContent: function (file) {
        if (this.handler) {
            return this.handler.call(file);
        }
    },
    setHandler: function (func) {
        if (typeof func) {
            this.handler = func;
        }
    }
};
