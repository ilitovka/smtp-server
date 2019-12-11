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
                    this.configService.refreshAccessToken(orgId).then((result) => {
                        log.debug('Refresh access token result: ');
                        log.debug(result);
                        if (result) {
                            let expire = moment().unix() + 8 * 3600;
                            if (result.expiration) {
                                expire = result.expiration;
                            }
                            return resolve(this.updateToken(orgId, new accessToken(result.access_token, result.instance_url, expire)));
                        } else {
                            return reject('Something wrong.');
                        }
                    }).catch(err => {
                        log.info(err);
                        return reject(err);
                    });
                }
                return resolve(accessTokenObject.getToken());
            }
        }

        this.configService.getAccessToken(orgId).then((result) => {
            log.debug('Get access token result: ');
            log.info(result);
            if (result) {
                let expire = moment().unix() + 8 * 3600;
                if (result.expiration) {
                    expire = result.expiration;
                }
                return resolve(this.addToken(orgId, new accessToken(result.access_token, result.instance_url, expire)));
            } else {
                return reject('Something wrong');
            }
        }).catch(err => {
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
