'use strict';

let callbacks = {
    onExistsSync: false,
    onMkdirSync: false,
    onCreateWriteStreamFinish: false,
    onReaddir: false,
    onMkdir: false,
    onReadFile: false,
    onReadFileP: false,
    onRmdir: false,
    onUnlinkSync: false,
    onCreateReadStream: false,
    onRemove: false,
    onWriteFile: false,
    onSimlink: false,
    onEnsureDir: false
};

module.exports = {
    setCallbacks: function (cbs) {
        callbacks = cbs;
    },
    existsSync: function (path) {
        if (callbacks.onExistsSync) {
            return callbacks.onExistsSync(path);
        }
        return true;
    },
    mkdirSync: function (path) {
        if (callbacks.onMkdirSync) {
            return callbacks.onMkdirSync(path);
        }
        return true;
    },
    createWriteStream: function (dest) {
        return new function () {
            var closeCB, finishCB;

            this.on = function (code, cb) {
                if (code === 'close') {
                    closeCB = cb;
                } else if (code === 'finish' && callbacks.onCreateWriteStreamFinish) {
                    return callbacks.onCreateWriteStreamFinish(dest, closeCB);
                }
            };

            this.finish = function () {
                if (callbacks.onCreateWriteStreamFinish) {
                    return callbacks.onCreateWriteStreamFinish(dest, closeCB);
                }
                closeCB();
            };
        };
    },
    readdir: function (folder, callback) {
        if (callbacks.onReaddir) {
            return callbacks.onReaddir(folder, callback);
        }
        callback(false, ['file1.json', 'file2.json', 'file3.json'])
    },
    readFile: function (file, callback) {
        if (callback) {
            if (callbacks.onReadFile) {
                return callbacks.onReadFile(file, callback);
            }
            callback(false, 'some_string_from_file');
        } else {
            if (callbacks.onReadFileP) {
                return new Promise((resolve, reject) => callbacks.onReadFileP(file, resolve, reject));
            }
            return new Promise((resolve, reject) => resolve('some_string_from_file'));
        }
    },
    rmdir: function (folder, callback) {
        if (callbacks.onRmdir) {
            return callbacks.onRmdir(folder, callback);
        }
        if (callback) {
            callback(false);
        }
    },
    mkdir: function (folder) {
        return new Promise((resolve, reject) => {
            if (callbacks.onMkdir) {
                return callbacks.onMkdir(folder, resolve, reject);
            } else {
                resolve();
            }
        });
    },
    unlinkSync: function (dest) {
        if (callbacks.onUnlinkSync) {
            return callbacks.onUnlinkSync(dest);
        }
        return true;
    },
    createReadStream: function (path) {
        return new function () {
            this.on = function (code, cb) {
                if (callbacks.onCreateReadStream) {
                    callbacks.onCreateReadStream(path, code, cb);
                }
                return this;
            };

            this.pipe = function (stream) {
                return this;
            };
        };
    },
    ensureDir: function (path) {
        return new Promise((resolve, reject) => {
            if (callbacks.onEnsureDir) {
                return callbacks.onEnsureDir(path, resolve, reject);
            } else {
                resolve();
            }
        });
    },
    remove: function (path, cb) {
        if (callbacks.onRemove) {
            return callbacks.onRemove(path, cb);
        }
        return true;
    },
    writeFile: function (path, content, cb) {
        return new Promise((resolve, reject) => {
            if (callbacks.onWriteFile) {
                return callbacks.onWriteFile(path, content, resolve, reject);
            } else {
                resolve();
            }
        });
    },
    symlink: function (source, dest) {
        if (callbacks.onSimlink) {
            return new Promise((resolve, reject) => callbacks.onSimlink(source, dest, resolve, reject));
        }
        return new Promise((resolve, reject) => resolve());
    }
};
