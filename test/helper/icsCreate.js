let test = require('tape');
let icsCreate = require('../../include/helper/icsCreate');

test('Calling icsCreate', function (t) {
  let compareString = 'BEGIN:VCALENDAR\r\n' +
    'VERSION:2.0\r\n' +
    'CALSCALE:GREGORIAN\r\n' +
    'PRODID:adamgibbons/ics\r\n' +
    'METHOD:PUBLISH\r\n' +
    'X-PUBLISHED-TTL:PT1H\r\n' +
    'BEGIN:VEVENT\r\n' +
    'UID:qwerty:oce__emailtransaction__c-D0000000-0000-0000-0000-000000000000\r\n' +
    'SUMMARY:Untitled event\r\n' +
    'DTSTAMP:20191219T162147Z\r\n' +
    'DTSTART:20191229T132100Z\r\n' +
    'DTEND:20191229T135100Z\r\n' +
    'ORGANIZER;CN=OCEADMIN OCEADMIN:mailto:00d5d000000devvua4@test.com\r\n' +
    'ATTENDEE;RSVP=TRUE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=Attendee 1\r\n\t' +
    ':mailto:attendee1@gmail.com\r\n' +
    'ATTENDEE;RSVP=TRUE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=Attendee 2\r\n\t' +
    ':mailto:attendee2@gmail.com\r\n' +
    'END:VEVENT\r\n' +
    'END:VCALENDAR\r\n';

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

  let createdString = icsCreate(compareObject);

  if (createdString) {
    t.equal(createdString, compareString, "Created successfully");
  } else {
    t.fail(createdString);
  }
});
