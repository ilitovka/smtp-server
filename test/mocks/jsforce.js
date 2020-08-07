let myPromise   = Promise,
    Fs          = require('./fs');

myPromise.prototype.query     = false;
myPromise.prototype.onRecord  = false;
myPromise.prototype.onEnd     = false;
myPromise.prototype.onError   = false;
myPromise.prototype.on        = function (code, cb) {
    switch (code) {
        case 'record':
            this.onRecord = cb;
            break;
        case 'end':
            this.onEnd = cb;
            break;
        case 'error':
            this.onError = cb;
            break;
    }
    return this;
};
myPromise.prototype.run       = function (options) {
    if (callbacks.onQueryRun !== undefined && callbacks.onQueryRun) {
        callbacks.onQueryRun(this);
    }
    return this;
};
myPromise.prototype.setQuery  = function (query) {
    this.query = query;
    return this;
};

let version = false;

let callbacks = {
    onMetaVersionRead: false,
    onMetaSettingsRead: false,
    onSobjectUpsert: false,
    onMetadataRead: false,
    onMetadataList: false,
    onMetadataUpsert: false,
    onSobjectFind: false,
    onQuery: false,
    onDescribe: false,
    onConnection: false,
    onQueryRun: false,
    onApexPost: false,
    onRequest: false
};

module.exports.setCallbacks = function (cbs, vers) {
    callbacks = cbs;
    version = vers !== undefined ? vers : false;
};

module.exports.Connection = function (config) {
    let self = this;
    if (callbacks.onConnection) {
        callbacks.onConnection(config);
    }

    this._baseUrl = function () { return '' };

    this.describe = function (customObject) {
        return new Promise(function (resolve, reject) {
            callbacks.onDescribe(customObject, resolve, reject, self.callOptions);
        });
    };

    this.request = function (url) {
        return new Promise(function (resolve, reject) {
            callbacks.onRequest(url, resolve, reject, self.callOptions);
        });
    };

    this.query = function (query, cb) {
        if (cb === undefined) {
            return (new myPromise(function (resolve, reject) {
                callbacks.onQuery(query, resolve, reject, self.callOptions);
            })).setQuery(query);
        } else {
            if (!version) {
                version = query.match(/Version__c = '(.*)'/)[1];
                callbacks.onMetaVersionRead(query, cb, self.callOptions);
            } else {
                version = false;
                callbacks.onMetaSettingsRead(query, cb, self.callOptions);
            }
        }
    };

    this.metadata = new function () {
        this.read = function (entity, list) {
            return new Promise(function (resolve, reject) {
                callbacks.onMetadataRead(entity, list, resolve, reject, self.callOptions);
            });
        };

        this.list = function (options) {
            return new Promise(function (resolve, reject) {
                callbacks.onMetadataList(options, resolve, reject, self.callOptions);
            });
        };

        this.upsert = function (entity, params) {
            return new Promise(function (resolve, reject) {
                callbacks.onMetadataUpsert(entity, params, resolve, reject, self.callOptions);
            });
        };

        this.retrieve = function (config) {
            return {
                stream: function () {
                    return Fs.createReadStream(config);
                }
            };
        };
    };

    this.sobject = function (name) {
        return new function () {
            this.upsert = function (data, field, cb) {
                return new Promise(function (resolve, reject) {
                    callbacks.onSobjectUpsert(name, data, field, resolve, reject, self.callOptions);
                });
            };

            this.find = function (cond, fields) {
                return new function () {
                    this.limit = function (limit) {
                        return this;
                    };

                    this.execute = function (cb) {
                        callbacks.onSobjectFind(name, cond, fields, cb, self.callOptions);
                        return this;
                    };
                };
            };
        };
    };

    this.apex = {
        post: function (path, obj) {
            return new Promise(function (resolve, reject) {
                if (callbacks.onApexPost) {
                    callbacks.onApexPost(path, obj, resolve, reject);
                } else {
                    resolve(obj);
                }
            });
        },
        patch: function (path, obj) {
            return new Promise(function (resolve, reject) {
                if (callbacks.onApexPost) {
                    callbacks.onApexPost(path, obj, resolve, reject);
                } else {
                    resolve(obj);
                }
            });
        }
    };
};
