const log = require('../libs/log').log;
const config = require('../config').config;
const jsforce = require('jsforce');
const sfTokenStorage = require('../include/sf-token-storage');

let sfApi = function () {
  this.sfOrgUrl = config.sfApi.endpoint;
  this.tokenStorage = new sfTokenStorage();
  this.connection = null;
};

/**
 * @param icsParsed {object} Parsed ICS file
 * */
sfApi.prototype.sendAttendeeStatuses = function (icsParsed) {
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
      if (!Array.isArray(icsParsed.attendee)) {
        icsParsed.attendee = [icsParsed.attendee];
      }
      for (let key in icsParsed.attendee) {
        let attendee = icsParsed.attendee[key];
        let email = attendee.val.toLowerCase().replace('mailto:', '');
        body.attendees.push({
          EventId: icsParsed.uid,
          attendee: email,
          Decision: attendee.params.PARTSTAT,
          //trid: icsParsed.xTRID[email] || ''
        });
      }

      log.debug(body);
      this._sendAttendeeStatuses(body).then(res => {
        log.info('Attendee statuses sent successfully: _sendAttendeeStatuses');
        return resolve(res);
      }).catch(err => {
        log.info('Attendee statuses sent failed: _sendAttendeeStatuses');
        return reject({message: err, code: 'SF_API_ATTENDEESTATUSESS_METHOD_ERROR'});
      });
    }).catch(err => {
      log.info('Attendee statuses sent failed: _sendAttendeeStatuses');
      return reject({message: err, code: 'ICS_STORAGE_GET_ACCESS_TOKEN_ERROR'});
    });
  }));
};

/**
 * @param accessToken
 * */
sfApi.prototype.connect = function (accessToken) {
  try {
    log.debug('Connecting to SF');
    this.prefix = accessToken.getPrefix() ? accessToken.getPrefix() + '/' : '';
    this.connection = new jsforce.Connection({
      instanceUrl: accessToken.getInstanceUrl(),
      accessToken: accessToken.getToken()
    });
    log.debug('connected');
  } catch (e) {
    log.info(e);
    throw new Error('Couldn\'t connect to SF API');
  }
};

sfApi.prototype._sendAttendeeStatuses = function (body) {
  try {
    log.debug('Connecting: /services/apexrest/' + this.prefix + 'AttendeeStatuses/');
    return this.connection.apex.patch('/services/apexrest/' + this.prefix + 'AttendeeStatuses/', body, function (err, res) {
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
    log.debug('Connecting: /services/apexrest/' + this.prefix + 'SendEmail/');
    return this.connection.apex.post('/services/apexrest/' + this.prefix + 'SendEmail/', attendees, function (err, res) {
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
