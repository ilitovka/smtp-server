const log = require('../libs/log').log;
const moment = require('moment');
const config = require('../config').config;
const crypto = require('../include/helper/crypto');
const configService = require('../include/configService');

let sfTokenStorage = function() {
    this.accessTokens = [];

    if (config.sfApi.accessToken && config.mode !== undefined && config.mode === 'sandbox') {
        this.addToken(config.sfApi.orgID, new accessToken(config.sfApi.accessToken, moment().unix() + 8 * 3600 ))
    }

    this.configService = new configService();
};

/**
 * @param orgId {string} - Org ID
 * @param token {accessToken} - access token object
 * */
sfTokenStorage.prototype.addToken = function(orgId, token) {
    this.accessTokens[orgId] = token;

    return this.accessTokens[orgId].getToken();
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

    return this.accessTokens[orgId].getToken();
};

sfTokenStorage.prototype.getAccessTokenByOrgId = function (orgId) {
    if (!orgId) {
        log.info('OrgID is undefined');
        return null;
    }

    if (this.accessTokens.includes(orgId)) {
        let accessTokenObject = this.accessTokens[orgId];

        if (accessTokenObject instanceof accessToken) {
            if (accessTokenObject.isExpire()) {
                return this.configService.refreshAccessToken(orgId).then((result) => {
                    if (result) {
                        let expire = moment().unix() + 8 * 3600;
                        if (result.expiration) {
                            expire = result.expiration;
                        }
                        return this.updateToken(orgId, new accessToken(result, expire));
                    } else {
                        throw new Error('Something wrong: ' + JSON.stringify(result));
                    }
                }).catch(err => {
                    log.info(err);
                    throw new Error(err);
                });
            }
            return accessTokenObject.getToken();
        }
    }

    return this.configService.getAccessToken(orgId).then((result) => {
        if (result) {
            let expire = moment().unix() + 8 * 3600;
            if (result.expiration) {
                expire = result.expiration;
            }
            return this.addToken(orgId, new accessToken(result, expire));
        } else {
            throw new Error('Something wrong: ' + JSON.stringify(result));
        }
    }).catch(err => {
        log.info(err);
        throw new Error(err);
    });
};

let accessToken = function(token, expire) {
    this.tokenCrypted = crypto.encrypt(token);
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

module.exports = sfTokenStorage;
