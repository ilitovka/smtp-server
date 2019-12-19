const config = require('../../config').config;
const icsParser = require('./icsParser');
const log = require('../../libs/log').log;

let mailParser = function() {
    this.parser = new icsParser();
};

/**
 * @param parsedMail {object}
 *
 * @return {Promise}
 * */
mailParser.prototype.parseAttachments = function (parsedMail) {
    return new Promise((resolve, reject) => {
        let recipient   = parsedMail.headers.get('to');
        let subject     = parsedMail.headers.get('subject');

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
                if (event.ORGID === undefined) {
                    event.ORGID = recipient.value[0].address.split('@')[0];
                }

                log.debug('Event info: ');
                log.debug(event);

                return resolve({content: content, event: event});
            }
        }
        return reject("Couldn't find attachment");
    });
};

module.exports = mailParser;
