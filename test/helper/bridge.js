const test = require('tape');
const moment = require('moment');

const bridge = require('../../include/helper/bridge');

test('Calling CalDav bridge', function (t) {
  t.plan(1);

  let bridgeObject = new bridge();
  let attachment = 'BEGIN:VCALENDAR\n' +
    'PRODID:-//salesforce.com//Calendar//EN\n' +
    'VERSION:2.0\n' +
    'METHOD:REQUEST\n' +
    'BEGIN:VEVENT\n' +
    'CLASS:PUBLIC\n' +
    'CREATED:20191219T142147Z\n' +
    'DTEND:20191229T135147Z\n' +
    'DTSTAMP:20191219T142147Z\n' +
    'DTSTART:20191229T132147Z\n' +
    'ORGANIZER;CN=OCEADMIN OCEADMIN:mailto:00D5D000000DEVVUA4@test.com\n' +
    'ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;\n' +
    ' X-NUM-GUESTS=0;CN=Attendee 1:mailto:attendee1@gmail.com\n' +
    'ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;\n' +
    ' X-NUM-GUESTS=0;CN=Attendee 2:mailto:attendee2@gmail.com\n' +
    'LOCATION:some location\n' +
    'PRIORITY:1\n' +
    'SEQUENCE:0\n' +
    'SUMMARY:summary\n' +
    'TRANSP:OPAQUE\n' +
    'UID:qwerty:oce__emailtransaction__c-D0000000-0000-0000-0000-000000000000\n' +
    'END:VEVENT\n' +
    'END:VCALENDAR';

  let parsedICS = {
    type: 'VEVENT',
    params: [],
    class: 'PUBLIC',
    created: moment(new Date('2019-12-19T14:21:47.000Z')).toISOString(),
    end: moment(new Date('2019-12-29T13:51:47.000Z')).toISOString(),
    dtstamp: moment(new Date('2019-12-19T14:21:47.000Z')).toISOString(),
    start: moment(new Date('2019-12-29T13:21:47.000Z')).toISOString(),
    datetype: 'date-time',
    organizer:
      {
        params: {CN: 'OCEADMIN OCEADMIN'},
        val: 'mailto:00D5D000000DEVVUA4@test.com'
      },
    attendee:
      [
        {
          params: {
            CUTYPE: 'INDIVIDUAL',
            ROLE: 'REQ-PARTICIPANT',
            PARTSTAT: 'NEEDS-ACTION',
            'X-NUM-GUESTS': 0,
            CN: 'Attendee 1'
          },
          val: 'mailto:attendee1@gmail.com'
        },
        {
          params: { CUTYPE: 'INDIVIDUAL',
            ROLE: 'REQ-PARTICIPANT',
            PARTSTAT: 'NEEDS-ACTION',
            'X-NUM-GUESTS': 0,
            CN: 'Attendee 2' },
          val: 'mailto:attendee2@gmail.com'
        }
      ],
    location: 'some location',
    priority: '1',
    sequence: '0',
    summary: 'summary',
    transparency: 'OPAQUE',
    ORGID: '00D5D000000DEVVUA4',
    uid: 'a3G5D000000B5gEUAS',
    eventId: 'oce__emailtransaction__c-D0000000-0000-0000-0000-000000000000'
  };

  bridgeObject.send(attachment, parsedICS).then(res => {
    t.pass(res);
  }).catch(err => {
    t.fail(err);
  });

});
