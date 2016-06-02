'use strict';

var logList = {
    error: [],
    warning: []
};

module.exports = {
    error: function (err) {

        if (!(err instanceof Error)) {
            err = new Error(err);
        }

        logList['error'].push(err);
        throw err;
    }
};
