const ics = require('ics');
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
      start: moment(event.start).format('YYYY-M-D-H-m').split("-").map(elem => +elem),
      end: moment(event.end).format('YYYY-M-D-H-m').split("-").map(elem => +elem),
      status: event.status,
      organizer: {
        name: event.organizer.params.CN,
        email: event.organizer.val.toLowerCase().replace('mailto:', '')
      },
      uid: event.uid
    };
    if (event.dtstamp) {
      eventMerged.timestamp = moment(event.dtstamp).format('YYYYMDTHms') + 'Z';
    }

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

    const {error, value} = ics.createEvent(eventMerged);
    if (error) {
      throw error;
    }

    return value;
  } catch (e) {
    throw e;
  }
};

module.exports = icsCreate;
