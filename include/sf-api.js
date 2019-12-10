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
    let accessToken = this.tokenStorage.getAccessTokenByOrgId(icsParsed.ORGID);

    if (this.accessToken === undefined) {
        throw new Error('SF token is undefined');
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

    return this._sendAttendeeStatuses(body);
};

/**
 * @param accessToken
 * */
sfApi.prototype.connect = function (accessToken) {
    try {
        log.debug(this.sfOrgUrl);
        log.debug(accessToken);
        this.connect = new jsforce.Connection({
            instanceUrl : this.sfOrgUrl,
            accessToken : accessToken
        });
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

            log.debug("response: ", res);

            return res;
        });
    } catch (e) {
        log.info(e);
        throw new Error('Couldn\'t send invites to attendee via SF API');
    }
};


module.exports = sfApi;
