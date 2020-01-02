const saveICS = require("../../handler/calendar").saveICS;
const log = require('../../libs/log').log;

const Bridge = function () {};

/**
 * @param {string} attachment
 * @param {object} parsedICS
 *
 * @return {Promise}
 *
 * */
Bridge.prototype.send = function (attachment, parsedICS) {
  return new Promise((resolve, reject) => {
    if (parsedICS.uid === undefined) {
      log.info('uid is undefined');
      return reject('uid is undefined');
    }
    if (parsedICS.ORGID === undefined) {
      parsedICS.ORGID = null;
      log.info('ORGID is undefined: Bridge.prototype.send');
    }

    //Save to caldav
    saveICS({
      UID: parsedICS.uid,
      calendarId: parsedICS.ORGID,
      content: attachment,
      parsed: parsedICS,
    }).then(() => {
      log.info('Event ID:' + parsedICS.uid + ' parsed and saved to calendar ID:' + parsedICS.ORGID);

      return resolve(parsedICS);
    }).catch(err => {
      log.debug(err);

      return reject(err);
    });
  });
};


module.exports = Bridge;
