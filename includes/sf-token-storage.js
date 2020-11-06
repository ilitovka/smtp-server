/**
 * @constructor
 *
 * @description Storage for access tokens
 * */
let sfTokenStorage = function (config, moment, helperCrypto, configService, logger, redis) {
  this.accessTokens = [];

  this.config = config;
  this.moment = moment;
  this.helperCrypto = helperCrypto;

  this.configService = configService;
  
  this.logger = logger;
  this.redis = redis;
};

/**
 * @param orgId {string} - Org ID
 * @param token {accessToken} - access token object
 * */
sfTokenStorage.prototype.setToken = function (orgId, token) {
  let result = {
    tokenCrypted: token.tokenCrypted,
    expire: token.expireTime,
    instance_url: token.instance_url,
    prefix: token.prefix
  };
  
  this.redis.hmset(`sfTokens:${orgId}`, 'tokenObj', JSON.stringify(result));

  return token;
};

/**
 * @param orgId {string} - access token object
 * */
sfTokenStorage.prototype.getToken = function (orgId) {
  return new Promise((resolve, reject) => {
    this.redis.hget(`sfTokens:${orgId}`, 'tokenObj').then(result => {
      if (!result) {
        resolve(null);
      }
      let resultParsed = JSON.parse(result);

      resolve(this.createToken(this.helperCrypto.decrypt(resultParsed.tokenCrypted), resultParsed.instance_url, resultParsed.expire, resultParsed.prefix));
    }).catch(err=>reject(err));
  });
};


/**
 * @param access_token {string} - access token object
 * @param instance_url {string} - access token object
 * @param expire {time} - access token object
 * @param prefix {string}
 * */
sfTokenStorage.prototype.createToken = function (access_token, instance_url, expire, prefix) {
  return new accessToken(access_token, instance_url, expire, prefix, this.helperCrypto, this.moment);
};

/**
 * @param orgId {string} SF Org ID
 * @return {Promise} access token
 * @throws Error
 * */
sfTokenStorage.prototype.getAccessTokenByOrgId = function (orgId) {
  return (new Promise((resolve, reject) => {
    if (!orgId) {
      //this.logger.log('OrgID is undefined');
      return reject('OrgID is undefined');
    }

    this.getToken(orgId).then(accessTokenObject => {
      if (accessTokenObject) {
        if (accessTokenObject instanceof accessToken) {
          if (!accessTokenObject.isExpire()) {
            this.logger.log('Access token found in memory: getAccessTokenByOrgId');
            return resolve(accessTokenObject);
          }
        }
      }
      this._getAccessToken(orgId)
        .then(result => {
          this.logger.log('Access token successfully received');
          return resolve(result);
        })
        .catch(err => {
          this.logger.log('Get Access token is failed');
          return reject(err);
        });
    }).catch(err => {
      reject(err);
    });
  }));
};

/**
 * @description Refresh SF Access Token via Config Service
 * @param orgId {string}
 *
 * @return {Promise}
 * */
sfTokenStorage.prototype._refreshToken = function (orgId) {
  return (new Promise((resolve, reject) => {
    if (!orgId) {
      return reject('OrgID is undefined');
    }

    this.configService.refreshAccessToken(orgId).then((result) => {
      if (result) {
        //this.logger.log('Access token successfully refreshed.');
        this._getAccessToken(orgId)
          .then(result => {
            return resolve(result);
          })
          .catch(err => {
            return reject(err);
          });
      } else {
        //this.logger.log('Refresh Access token is failed: _refreshToken.then()');
        return reject('Refresh Access token is failed.');
      }
    }).catch(err => {
      //this.logger.log('Refresh Access token is failed: _refreshToken.catch()');
      return reject(err);
    });
  }));
};

/**
 * @description Retrive SF ORGID access token/instance url/expiration from Config Service
 * @param orgId {string}
 *
 * @return {Promise}
 * */
sfTokenStorage.prototype._getAccessToken = function (orgId) {
  return (new Promise((resolve, reject) => {
    if (!orgId) {
      return reject('OrgID is undefined');
    }
    
    this.configService.getAccessToken(orgId).then((result) => {
      this.logger.log(result.instance_url);
      this.logger.log(result.access_token_expiration);
      if (result) {
        let expire = result.access_token_expiration !== undefined ?
          this.moment(result.access_token_expiration).unix()
          : this.moment().unix() + this.config.configService.defaultLifetime;
        let prefix = result.namespace_prefix !== undefined ? result.namespace_prefix : this.config.sfApi.defaultNamespace;

        this.logger.log('Access token successfully received: _getAccessToken');

        return resolve(this.setToken(orgId, this.createToken(result.access_token, result.instance_url, expire, prefix)));
      } else {
        this.logger.log('Access token failed: _getAccessToken.then()');
        return reject('Something wrong');
      }
    }).catch(err => {
      this.logger.log('Access token failed: _getAccessToken.catch()');
      return reject(err);
    });
  }));
};

/**
 * @param token {string}
 * @param instance_url {string}
 * @param expire {number}
 * @param prefix {string}
 *
 * @constructor
 * */
let accessToken = function (token, instance_url, expire, prefix, crypto, moment) {
  this.instance_url = instance_url;
  this.expireTime = expire;
  this.prefix = prefix;
  this.crypto = crypto;
  this.moment = moment;
  this.tokenCrypted = this.crypto.encrypt(token);
};

/**
 * @return {boolean}
 * */
accessToken.prototype.isExpire = function () {
  return this.expireTime < this.moment().unix();
};

/**
 * @description return decrypted access token
 * @return {string}
 * */
accessToken.prototype.getToken = function () {
  return this.crypto.decrypt(this.tokenCrypted);
};

/**
 * @description return SF org instance url
 * @return {string}
 * */
accessToken.prototype.getInstanceUrl = function () {
  return this.instance_url;
};

/**
 * @description return SF org prefix (namespace)
 * @return {string}
 * */
accessToken.prototype.getPrefix = function () {
  return this.prefix;
};

module.exports = sfTokenStorage;
