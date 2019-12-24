const saveICS = require("../../handler/calendar").saveICS;
const log = require('../../libs/log').log;
const bridgeSF = require('../../include/helper/bridgeSF');

const Bridge = function () {
  this.bridgeSF = new bridgeSF();
};

/**
 * @param {string} attachment
 * @param {string} parsedICS
 *
 * @return {boolean}
 *
 * */
Bridge.prototype.send = function (attachment, parsedICS) {
  if (parsedICS.uid === undefined) {
    log.info('uid is undefined');
    return false;
  }
  if (parsedICS.ORGID === undefined) {
    parsedICS.ORGID = null;
    log.info('ORGID is undefined: Bridge.prototype.send');
    //return false;
  }

  //Save to caldav
  saveICS({
    UID: parsedICS.uid,
    calendarId: parsedICS.ORGID,
    content: attachment,
    parsed: parsedICS,
  }).then(result => {
    log.info(result);

    this.bridgeSF.sendSf(parsedICS).then(result => {
      log.info(result);
    }).catch(err => {
      log.info(err);
    });

    log.info('Event ID:' + parsedICS.uid + ' parsed and saved to calendar ID:' + parsedICS.ORGID);
  }).catch(err => {
    log.debug(err);
  });

  return true;
};


module.exports = Bridge;
