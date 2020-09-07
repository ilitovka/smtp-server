const log = require('../../libs/log').log;

/**
 * @description Bridge to SF
 * @constructor
 * */
const BridgeSF = function (sfAPi) {
  this.sfApi = sfAPi;
};

/**
 * @param {object} parsedICS
 *
 * @return {Promise}
 *
 * */
BridgeSF.prototype.sendSf = function (parsedICS) {
  return new Promise((resolve, reject) => {
    if (parsedICS.ORGID === undefined) {
      return reject("ORGID is undefined: BridgeSF.prototype.sendSf");
    }
    //send to SalesForce
    this.sfApi.sendAttendeeStatuses(parsedICS).then(result => {
      log.debug(result);
      return resolve(result);
    }).catch(err => {
      log.debug(err);
      return reject(err);
    });
  });
};

module.exports = BridgeSF;
