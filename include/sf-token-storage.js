const log = require('../libs/log').log;
const moment = require('moment');
const config = require('../config').config;
const crypto = require('../include/helper/crypto');
const configService = require('../include/configService');

let sfTokenStorage = function() {
    this.accessTokens = [];

    if (config.sfApi.accessToken && config.mode !== undefined && config.mode === 'sandbox') {
        this.addToken(config.sfApi.orgID, new accessToken(config.sfApi.accessToken, moment().unix() + 3 * 24 * 3600 ))
    }

    this.configService = new configService();
};

/**
 * @param orgId {string} - Org ID
 * @param token {accessToken} - access token object
 * */
sfTokenStorage.prototype.addToken = function(orgId, token) {
    this.accessTokens[orgId] = token;

    return this.accessTokens[orgId];
};

/**
 * @param orgId {string} - Org ID
 * */
sfTokenStorage.prototype.removeToken = function(orgId) {
    delete this.accessTokens[orgId];
};

/**
 * @param orgId {string} - access token object
 * @param token {accessToken} - access token object
 * */
sfTokenStorage.prototype.updateToken = function(orgId, token) {
    this.accessTokens[orgId] = token;

    return this.accessTokens[orgId];
};

/**
 * @param access_token {string} - access token object
 * @param instance_url {string} - access token object
 * @param expire {time} - access token object
 * */
sfTokenStorage.prototype.createToken = function(access_token, instance_url, expire) {
    return new accessToken(access_token, instance_url, expire);
};

/**
 * @param orgId {string} SF Org ID
 * @return {Promise} access token
 * @throws Error
 * */
sfTokenStorage.prototype.getAccessTokenByOrgId = function (orgId) {
    return (new Promise((resolve, reject) => {
        if (!orgId) {
            log.info('OrgID is undefined');
            return reject('OrgID is undefined');
        }

        if (this.accessTokens[orgId] !== undefined) {
            let accessTokenObject = this.accessTokens[orgId];

            if (accessTokenObject instanceof accessToken) {
                if (accessTokenObject.isExpire()) {
                    this._refreshToken(orgId)
                        .then(result => {
                            log.info('Access token refreshed and received');
                            return resolve(result);
                        })
                        .catch(err => {
                            log.info('Access token refresh failed: getAccessTokenByOrgId.then()');
                            return reject(err);
                        });
                }
                log.info('Access token found in memory: getAccessTokenByOrgId.then()');
                return resolve(accessTokenObject);
            }
        }

        this._getAccessToken(orgId)
            .then(result => {
                log.info('Access token successfully received');
                return resolve(result);
            })
            .catch(err => {
                log.info('Get Access token is failed');
                return reject(err);
            });
    }));
};

sfTokenStorage.prototype._refreshToken = function (orgId) {
    return (new Promise((resolve, reject) => {
        if (!orgId) {
            return reject('OrgID is undefined');
        }

        this.configService.refreshAccessToken(orgId).then((result) => {
            if (result) {
                log.info('Access token successfully refreshed.');
                this._getAccessToken(orgId)
                    .then(result => {
                        return resolve(result);
                    })
                    .catch(err => {
                        return reject(err);
                    });
            } else {
                log.info('Refresh Access token is failed: _refreshToken.then()');
                return reject('Refresh Access token is failed.');
            }
        }).catch(err => {
            log.info('Refresh Access token is failed: _refreshToken.catch()');
            return reject(err);
        });
    }));
};

sfTokenStorage.prototype._getAccessToken = function (orgId) {
    return (new Promise((resolve, reject) => {
        if (!orgId) {
            return reject('OrgID is undefined');
        }

        this.configService.getAccessToken(orgId).then((result) => {
            if (result) {
                let expire = moment().unix() + 8 * 3600;
                if (result.expireTime) {
                    expire = result.expireTime;
                }
                log.info('Access token successfully received: _getAccessToken');
                return resolve(this.addToken(orgId, new accessToken(result.access_token, result.instance_url, expire)));
            } else {
                log.info('Access token failed: _getAccessToken.then()');
                return reject('Something wrong');
            }
        }).catch(err => {
            log.info('Access token failed: _getAccessToken.catch()');
            return reject(err);
        });
    }));
};

let accessToken = function(token, instance_url, expire) {
    this.tokenCrypted = crypto.encrypt(token);
    this.instance_url = instance_url;
    this.expireTime = expire;
};

accessToken.prototype.isExpire = function() {
    if (this.expireTime < moment().unix()) {
        return true;
    }
    return false;
};

accessToken.prototype.getToken = function() {
    return crypto.decrypt(this.tokenCrypted);
};

accessToken.prototype.getInstanceUrl = function() {
    return this.instance_url;
};

module.exports = sfTokenStorage;