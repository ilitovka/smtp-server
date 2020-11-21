/**
 * @description Bridge to SF
 * @constructor
 * */
const BridgeSF = function (sfAPi, logger) {
  this.sfApi = sfAPi;
  this.logger = logger;
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
      this.logger.log(result);
      return resolve(result);
    }).catch(err => {
      this.logger.log(err);
      return reject(err);
    });
  });
};

module.exports = BridgeSF;
