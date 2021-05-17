const icsParse = function (ical, logger) {
  this.ical = ical;
  this.logger = logger;
};

/**
 * @param {string} text
 *
 * @return {array}
 *
 * */
icsParse.prototype.parse = function (text) {
  return this.ical.parseICS(text);
};

/**
 * @param text {string} ICS in string format
 * @return {mixed} boolean or object
 * */
icsParse.prototype.parseFirst = function (text) {
  let events = this.parse(text);
  if (Object.keys(events).length > 0) {
    for (let k in events) {
      if (events.hasOwnProperty(k)) {
        const event = events[k];
        if (event.type === 'VEVENT') {
          this.logger.log('Attachment parsed successfully');

          return event;
        }
      } else {
        this.logger.log('Couldn\'t parse attachment object');
      }
    }
  } else {
    this.logger.log('Couldn\'t parse attachment');
  }

  return null;
};

module.exports = icsParse;
