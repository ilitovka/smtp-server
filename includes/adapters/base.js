class BaseAdapter {
  constructor(parser, logger) {
    this.parser = parser;
    this.logger = logger;
  }

  parseAttachment(parsedMail) {
    return new Promise((resolve, reject) => {
      let recipient = parsedMail.headers.get('to');
      let fromMail = parsedMail.headers.get('from');
      let subject = parsedMail.headers.get('subject');

      this.logger.log('From mail: ' + JSON.stringify(fromMail));
      this.logger.log('Subject: ' + JSON.stringify(subject));

      if (parsedMail.attachments !== undefined && parsedMail.attachments.length > 0) {
        let checksumArray = [];
        for (let i = 0; i < parsedMail.attachments.length; i++) {
          let checksumValue = parsedMail.attachments[i].checksum;
          this.logger.log('Checksum: ' + checksumValue);
          if (checksumArray.includes(checksumValue)) {
            this.logger.log('Duplicated: ' + checksumValue);
            continue;
          }
          checksumArray.push(checksumValue);

          let content = parsedMail.attachments[i].content.toString('utf8');
          let event = this.parser.parseFirst(content);

          this.logger.log('Event parsed: ' + JSON.stringify(event));

          let fromMailList = [];
          event.fromMail = fromMail;
          for (let i = 0; i < fromMail.value.length; i++) {
            fromMailList.push(fromMail.value[i].address);
          }

          if (event.attendee !== undefined && Array.isArray(event.attendee)) {
            let attendees = event.attendee;
            let newArrayAttendees = [];
            for (let i = 0; i < attendees.length; i++) {
              //replacing "mailto:" from mail string to compare with sender information
              if (fromMailList.indexOf(attendees[i].val.substring(7) ) !== -1) {
                newArrayAttendees.push(attendees[i]);
              }
            }
            event.attendee = newArrayAttendees;
          }

          if (event.attendee === undefined || event.attendee.length === 0) {
            event.attendee = [];
            for (let i = 0; i < fromMailList.length; i++) {
              let answer = subject.split(':');
              event.attendee.push({
                params: {
                  RSVP: true,
                  ROLE: 'REQ-PARTICIPANT',
                  PARTSTAT: answer[0],
                  CN: fromMailList[i]
                },
                val: 'mailto:' + fromMailList[i]
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

          event.eventId = null;
          if (event.uid !== undefined) {
            let uid = event.uid.split(':');
            switch (uid.length) {
              case 3:
                event.ORGID = uid[0];
                event.eventId = uid[2];
                break;
              case 2:
                event.eventId = uid[1];
                break;
            }
          }

          if (event.ORGID === undefined || !event.ORGID) {
            event.ORGID = organizer.split('@')[0];
          }

          if (event.organizer === undefined) {
            event.organizer = {
              params: organizer,
              val: 'mailto:' + organizer
            };
          }
          event.xTRID = this.retrieveXTRID(event);

          this.logger.log('Event info: ');
          this.logger.log(JSON.stringify({
            organizer: event.organizer,
            attendee: event.attendee,
            uid: event.uid,
            eventId: event.eventId
          }));

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
