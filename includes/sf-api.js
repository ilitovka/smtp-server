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

      // Init new connection to Salesforce
      this.initConnection(accessToken);

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
      
      this._sendAttendeeStatusesWithRetry(body, orgId).then(res => {
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

sfApi.prototype._sendAttendeeStatusesWithRetry = function (body, orgId) {
  return this._sendAttendeeStatuses(body)
    .catch(err => {
      if (!this._isInvalidSessionId(err)) {
        throw err;
      }

      this.logger.warn(`${err.message} (OrgId - ${orgId})`);

      // Get new access token from Config Service
      return this._getAccessToken(orgId)
        .then(accessToken => {
            // Init new connection to Salesforce
            this.initConnection(accessToken);

            return this._sendAttendeeStatuses(body);
        });
    });
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

sfApi.prototype.initConnection = function (accessToken) {
  if (accessToken === undefined) {
    throw new Error('SF token is undefined');
  }

  this.connect(accessToken);
}

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

    if (this._isInvalidSessionId(e)) {
      throw e;
    }

    throw new Error('Couldn\'t send attendee statuses to SF API. Error: ' + e.message);
  }
};

// TODO: deprecated
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

    if (this._isInvalidSessionId(e)) {
      throw e;
    }

    throw new Error('Couldn\'t send invites to attendee via SF API');
  }
};

sfApi.prototype._isInvalidSessionId = function (error) {
  if (error && error.errorCode === 'INVALID_SESSION_ID') {
    return true;
  }

  return false;
};


module.exports = sfApi;
