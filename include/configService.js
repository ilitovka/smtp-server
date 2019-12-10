const config = require('../config').config;

/**
 * ConfigService client, being used to validate ord id
 *
 */
let configServiceClient = function () {
    this.config     = config;
    this.Request    = require('request');
};

/**
 * Requesting ConfigService to generate SF access token
 *
 * @param {String} orgId - ORG ID
 * @return {Promise} - Promise which will be resolved/rejected with validation result
 */
configServiceClient.prototype.generateAccessToken = function (orgId) {
    return (new Promise((resolve, reject) => {
        // checking if org validation configured
        if (!this.config.configService.url.length) {
            return reject('Config Service URL should be configured');
        }
        if (!this.config.configService.apiKey.length) {
            return reject('Config Service API KEY should be configured');
        }

        this.Request({
            method:     'POST',
            headers:    {
                'Content-Type' : 'application/json',
                'Authorization': ' Bearer ' + this.config.configService.apiKey
            },
            url:        this.config.configService.url + '/api/sf/generate-token',
            body:       JSON.stringify({
                orgId: orgId,
                orgType: this.config.mode
            })
        }, function (error, response, body) {
            try {
                if (error) {
                    return reject({ message: error, code: 'CONFIG_SERVICE_NETWORK_ERROR' });
                } else if (response && response.statusCode !== 200) {
                    return reject({ message: JSON.parse(body), code: 'CONFIG_SERVICE_DISCARD' });
                }

                return resolve(JSON.parse(body));
            } catch (err) {
                return reject({ message: err, code: 'CONFIG_SERVICE_ERROR' });
            }
        });
    }));
};

/**
 * Requesting ConfigService to retrieve SF access token
 *
 * @param {String} orgId - ORG ID
 * @return {Promise} - Promise which will be resolved/rejected with validation result
 */
configServiceClient.prototype.getAccessToken = function (orgId) {
    return (new Promise((resolve, reject) => {
        // checking if org validation configured
        if (!this.config.configService.url.length) {
            return reject('Config Service URL should be configured');
        }
        if (!this.config.configService.apiKey.length) {
            return reject('Config Service API KEY should be configured');
        }

        this.Request({
            method:     'POST',
            headers:    {
                'Content-Type' : 'application/json',
                'Authorization': ' Bearer ' + this.config.configService.apiKey
            },
            url:        this.config.configService.url + '/api/sf/get-token',
            body:       JSON.stringify({
                orgId: orgId,
                orgType: this.config.mode
            })
        }, function (error, response, body) {
            try {
                if (error) {
                    return reject({ message: error, code: 'CONFIG_SERVICE_NETWORK_ERROR' });
                } else if (response && response.statusCode !== 200) {
                    return reject({ message: JSON.parse(body), code: 'CONFIG_SERVICE_DISCARD' });
                }

                return resolve(JSON.parse(body));
            } catch (err) {
                return reject({ message: err, code: 'CONFIG_SERVICE_ERROR' });
            }
        });
    }));
};

/**
 * Requesting ConfigService to refresh SF access token
 *
 * @param {String} orgId - ORG ID
 * @return {Promise} - Promise which will be resolved/rejected with validation result
 */
configServiceClient.prototype.refreshAccessToken = function (orgId) {
    return (new Promise((resolve, reject) => {
        // checking if org validation configured
        if (!this.config.configService.url.length) {
            return reject('Config Service URL should be configured');
        }
        if (!this.config.configService.apiKey.length) {
            return reject('Config Service API KEY should be configured');
        }

        this.Request({
            method:     'POST',
            headers:    {
                'Content-Type' : 'application/json',
                'Authorization': ' Bearer ' + this.config.configService.apiKey
            },
            url:        this.config.configService.url + '/api/sf/refresh-token',
            body:       JSON.stringify({
                orgId: orgId,
                orgType: this.config.mode
            })
        }, function (error, response, body) {
            try {
                if (error) {
                    return reject({ message: error, code: 'CONFIG_SERVICE_NETWORK_ERROR' });
                } else if (response && response.statusCode !== 200) {
                    return reject({ message: JSON.parse(body), code: 'CONFIG_SERVICE_DISCARD' });
                }

                return resolve(JSON.parse(body));
            } catch (err) {
                return reject({ message: err, code: 'CONFIG_SERVICE_ERROR' });
            }
        });
    }));
};

module.exports = configServiceClient;
