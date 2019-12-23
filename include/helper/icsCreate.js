const ics = require('ics');
const log = require('../../libs/log').log;
const moment = require('moment');

/**
 *
 * @param event {object} Parsed ICS event
 *
 * @return {string}
 * */
const icsCreate = function (event) {
  try {
    const eventMerged = {
      start: moment(event.start).format('YYYY-M-D-H-m').split("-"),
      end: moment(event.end).format('YYYY-M-D-H-m').split("-"),
      status: event.status,
      organizer: {
        name: event.organizer.params.CN,
        email: event.organizer.val.toLowerCase().replace('mailto:', '')
      },
      uid: event.uid
    };

    let attendees = [];
    for (let key in event.attendee) {
      let attendee = event.attendee[key];
      attendees.push(
        {
          email: attendee.val.toLowerCase().replace('mailto:', ''),
          rsvp: true,
          partstat: attendee.params.PARTSTAT,
          role: attendee.params.ROLE,
          name: attendee.params.CN
        }
      );
    }
    eventMerged.attendees = attendees;

    return ics.createEvent(eventMerged).value;
  } catch (e) {
    log.debug(e.stack);
    return '';
  }
};

module.exports = icsCreate;
