const icsParser = require('../helper/icsParser');
const log = require('../../libs/log').log;

class BaseAdapter {
  constructor() {
    this.parser = new icsParser();
  }

  parseAttachment(parsedMail) {
    return new Promise((resolve, reject) => {
      let recipient = parsedMail.headers.get('to');
      let subject = parsedMail.headers.get('subject');

      if (parsedMail.attachments !== undefined && parsedMail.attachments.length > 0) {
        let checksumArray = [];
        for (let i = 0; i < parsedMail.attachments.length; i++) {
          let checksumValue = parsedMail.attachments[i].checksum;
          log.debug('Checksum: ' + checksumValue);
          if (checksumArray.includes(checksumValue)) {
            log.debug('Duplicated: ' + checksumValue);
            continue;
          }
          checksumArray.push(checksumValue);

          let content = parsedMail.attachments[i].content.toString('utf8');
          let event = this.parser.parseFirst(content);

          if (event.attendee === undefined) {
            event.attendee = [];
            for (let i = 0; i < recipient.value.length; i++) {
              let answer = subject.split(':');
              event.attendee.push({
                params: {
                  RSVP: true,
                  ROLE: 'REQ-PARTICIPANT',
                  PARTSTAT: answer[0],
                  CN: recipient.value[i].address
                },
                val: 'mailto:' + recipient.value[i].address
              });

            }
          }
          if (!Array.isArray(event.attendee)) {
            event.attendee = [event.attendee];
          }
          let organizer = '@';
          if (recipient.value[0] !== undefined && recipient.value[0].address !== undefined) {
            organizer = recipient.value[0].address;
          }
          if (event.ORGID === undefined) {
            event.ORGID = organizer.split('@')[0];
          }
          event.eventId = null;
          if (event.uid !== undefined) {
            let uid = event.uid.split(':');
            event.uid = uid[0];
            if (uid[1] !== undefined) {
              event.eventId = uid[1];
            }
          }
          if (event.organizer === undefined) {
            event.organizer = {
              params: organizer,
              val: 'mailto:' + organizer
            };
          }
          event.xTRID = this.retrieveXTRID(event);

          log.debug('Event info: ');
          log.debug({
            organizer: event.organizer,
            attendee: event.attendee,
            uid: event.uid,
            eventId: event.eventId
          });

          return resolve({content: content, event: event});
        }
      }
      return reject("Couldn't find attachment");
    });
  }

  /**
   * @param parsedAttachment {object} parsed attachment
   * @return {array}
   * */
  retrieveXTRID(parsedAttachment) {
    let result = [];

    for (let key in parsedAttachment) {
      if (!key.startsWith('TRID-')) {
        continue;
      }
      let parsedString = parsedAttachment[key].split(':');

      result[parsedString[0]] = parsedString[1];
    }

    return result;
  }

  checkMail(parsedMail) {
    return true;
  }
}

module.exports = BaseAdapter;
