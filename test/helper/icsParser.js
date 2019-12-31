let test = require('tape');
let icsParser = require('../../include/helper/icsParser');

test('Calling icsParser', function (t) {
  let ics = 'BEGIN:VCALENDAR\n' +
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
    'X-ORGID:00D5D000000DEVVUA4\n' +
    'UID:qwerty:oce__emailtransaction__c-D0000000-0000-0000-0000-000000000000\n' +
    'END:VEVENT\n' +
    'END:VCALENDAR';

  let compareObject = {
    type: 'VEVENT',
    params: [],
    class: 'PUBLIC',
    created: new Date('2019-12-19T14:21:47.000Z'),
    end: new Date('2019-12-29T13:51:47.000Z'),
    dtstamp: new Date('2019-12-19T14:21:47.000Z'),
    start: new Date('2019-12-29T13:21:47.000Z'),
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
    uid: 'qwerty:oce__emailtransaction__c-D0000000-0000-0000-0000-000000000000',
  };

  t.plan(1);

  let icsParseObject = new icsParser();

  let parsed = icsParseObject.parseFirst(ics);

  if (parsed) {
    t.deepEqual(parsed, compareObject, "Parsed successfully");
  } else {
    t.fail('Failed parse ics');
  }
});
