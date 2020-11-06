let sfApi = function (logger, config, jsforce, sfTokenStorage) {
  this.config = config;
  this.jsforce = jsforce;
  this.tokenStorage = sfTokenStorage;
  this.connection = null;
  this.logger = logger;
};

/**
 * @param icsParsed {object} Parsed ICS file
 * */
sfApi.prototype.sendAttendeeStatuses = function (icsParsed) {
  return (new Promise((resolve, reject) => {
    let orgId = icsParsed.ORGID.slice(0, 15);
    this.tokenStorage.getAccessTokenByOrgId(orgId).then(accessToken => {
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
          EventId: icsParsed.eventId,
          attendee: email,
          Decision: attendee.params.PARTSTAT,
          //trid: icsParsed.xTRID[email] || ''
        });
      }

      this.logger.log(body);
      this._sendAttendeeStatuses(body).then(res => {
        this.logger.log('Attendee statuses sent successfully: _sendAttendeeStatuses');
        return resolve(res);
      }).catch(err => {
        this.logger.log('Attendee statuses sent failed: _sendAttendeeStatuses');
        return reject({message: err, code: 'SF_API_ATTENDEESTATUSESS_METHOD_ERROR'});
      });
    }).catch(err => {
      this.logger.log('Attendee statuses sent failed: _sendAttendeeStatuses');
      return reject({message: err.message, code: 'ICS_STORAGE_GET_ACCESS_TOKEN_ERROR', err: err});
    });
  }));
};

/**
 * @param accessToken
 * */
sfApi.prototype.connect = function (accessToken) {
  try {
    this.logger.log('Connecting to SF');
    this.prefix = accessToken.getPrefix() ? accessToken.getPrefix() + '/' : '';
    this.connection = new this.jsforce.Connection({
      instanceUrl: accessToken.getInstanceUrl(),
      accessToken: accessToken.getToken()
    });
    this.logger.log('connected');
  } catch (e) {
    this.logger.log(e);
    throw new Error('Couldn\'t connect to SF API');
  }
};

sfApi.prototype._sendAttendeeStatuses = function (body) {
  try {
    this.logger.log('Connecting: /services/apexrest/' + this.prefix + 'EmailStatus/');
    return this.connection.apex.patch('/services/apexrest/' + this.prefix + 'EmailStatus/', body, (err, res) => {
      if (err) {
        return this.logger.error(err);
      }

      this.logger.log("response: ", res);

      return res;
    });
  } catch (e) {
    this.logger.log(e);
    throw new Error('Couldn\'t send attendee statuses to SF API. Error: ' + e.message);
  }
};

sfApi.prototype._sendInvite = function (attendees) {
  try {
    this.logger.log('Connecting: /services/apexrest/' + this.prefix + 'SendEmail/');
    return this.connection.apex.post('/services/apexrest/' + this.prefix + 'SendEmail/', attendees, (err, res) => {
      if (err) {
        return this.logger.error(err);
      }

      return res;
    });
  } catch (e) {
    this.logger.log(e);
    throw new Error('Couldn\'t send invites to attendee via SF API');
  }
};


module.exports = sfApi;
