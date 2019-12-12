const log = require('../libs/log').log;
const config = require('../config').config;
const jsforce = require('jsforce');
const sfTokenStorage = require('../include/sf-token-storage');

let sfApi = function() {
    this.sfOrgUrl = config.sfApi.endpoint;
    this.tokenStorage = new sfTokenStorage();
};

/**
 * @param icsParsed {object} Parsed ICS file
 * */
sfApi.prototype.sendAttendeeStatuses = function(icsParsed) {
    return (new Promise((resolve, reject) => {
        let orgId = icsParsed.ORGID.slice(0, 15);
        this.tokenStorage.getAccessTokenByOrgId(orgId).then(accessToken => {
            log.debug(accessToken);
            if (accessToken === undefined) {
                return reject('SF token is undefined');
            }

            this.connect(accessToken);

            // body payload structure is depending to the Apex REST method interface.
            let body = {
                attendees: []
            };
            for (let i = 0; i < icsParsed.attendee.length; i++) {
                body.attendees.push({
                    EventId: icsParsed.uid,
                    attendee: icsParsed.attendee[i].val.replace('mailto:', ''),
                    Decision: icsParsed.attendee[i].params.PARTSTAT
                });
            }

            log.debug(body);
            this._sendAttendeeStatuses(body).then(res => {
                log.info('Attendee statuses sent successfully: _sendAttendeeStatuses');
                log.info(res);
                return resolve(res);
            }).catch(err => {
                log.info('Attendee statuses sent failed: _sendAttendeeStatuses');
                return reject({ message: err, code: 'SF_API_ATTENDEESTATUSESS_METHOD_ERROR' });
            });
        }).catch(err => {
            log.info('Attendee statuses sent failed: _sendAttendeeStatuses');
            log.debug(err);
            return reject({ message: err, code: 'ICS_STORAGE_GET_ACCESS_TOKEN_ERROR' });
        });
    }));
};

/**
 * @param accessToken
 * */
sfApi.prototype.connect = function (accessToken) {
    try {
        log.debug('Connecting to SF');
        this.connect = new jsforce.Connection({
            instanceUrl : accessToken.getInstanceUrl(),
            accessToken : accessToken.getToken()
        });
        log.debug('connected');
    } catch (e) {
        log.info(e);
        throw new Error('Couldn\'t connect to SF API');
    }
};

sfApi.prototype._sendAttendeeStatuses = function (body) {
    try {
        return this.connect.apex.patch('/services/apexrest/AttendeeStatuses/', body, function(err, res) {
            if (err) {
                return console.error(err);
            }

            log.debug("response: ", res);

            return res;
        });
    } catch (e) {
        log.info(e);
        throw new Error('Couldn\'t send attendee statuses to SF API');
    }
};

sfApi.prototype._sendInvite = function (attendees) {
    try {
        return this.connect.apex.post('/services/apexrest/SendEmail/', attendees, function(err, res) {
            if (err) {
                return console.error(err);
            }

            return res;
        });
    } catch (e) {
        log.info(e);
        throw new Error('Couldn\'t send invites to attendee via SF API');
    }
};


module.exports = sfApi;
