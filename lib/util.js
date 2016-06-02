'use strict';
var fs = require('fs');
var pth = require('path');
var log = require('./log.js');
var _ = module.exports = {};

_.fs = fs;
_.path = pth;
_.exists = fs.existsSync;
/**
 * 规范path, 统一用liunx平台的分割符
 */
_.normalize = function (path) {
    var type = typeof path;

    if (arguments.length > 1) {
        path = Array.prototype.join.call(arguments, '/');
    } else if (type === 'object') {
        path = Array.prototype.join.call(path, '/');
    } else if (type === 'undefined') {
        path = '';
    } else if (type === 'string') {
    }
    if (path) {
        path = pth.normalize(path.replace(/[\/\\]+/g, '/')).replace(/\\/g, '/');
        if (path !== '/') {
            path = path.replace(/\/$/, '');
        }
    }
    return path;
};

_.extname = function (path) {
    return _.path.extname(path).toLocaleLowerCase().replace('.', '');
};

_.isJS = function (path) {
    return _.extname(path) === 'js';
};

_.isHtml = function (path) {
    return _.extname(path) === 'html' || _.extname(path) === 'htm';
};
_.realpath = function (path) {
    if (path && _.exists(path)) {
        path = fs.realpathSync(path);
        path = _.normalize(path);
        if (path !== '/') {
            path = path.replace(/\/$/, '');
        }
        return path;
    } else {
        return false;
    }
};

_.isFile = function (path) {
    return _.exists(path) && fs.statSync(path).isFile();
};

_.isDir = function (path) {
    return _.exists(path) && fs.statSync(path).isDirectory();
};

_.read = function (path) {
    var content = false;

    if (_.exists(path)) {
        content = fs.readFileSync(path);
    } else {
        log.error('unable to read file[' + path + ']: No such file or directory.');
    }
    return content;
};
_.write = function (path, data, charset, append) {
    if (!_.exists(path)) {
        _.mkdir(_.path.dirname(path));
    }
    if (append) {
        fs.appendFileSync(path, data, null);
    } else {
        fs.writeFileSync(path, data, null);
    }
};
_.mkdir = function (path, mode) {
    if (typeof mode === 'undefined') {

        mode = 511 & (~process.umask());
    }
    if (_.exists(path)) {
        return;
    }
    path.split('/').reduce(function (prev, next) {
        if (prev && !_.exists(prev)) {
            fs.mkdirSync(prev, mode);
        }
        return prev + '/' + next;
    });
    if (!_.exists(path)) {
        fs.mkdirSync(path, mode);
    }
};
_.merge = function (target, source) {
    for (var k in source) {
        target[k] = source[k];
    }
    return target[k];
};

