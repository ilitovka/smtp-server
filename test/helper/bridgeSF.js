const test = require('tape');
const bridgeSF = require('../../include/helper/bridgeSF');

test('Calling bridgeSF', function (t) {
  t.plan(1);

  let bridgeObject = new bridgeSF();

  let parsedICS = {
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
    uid: 'qwerty',
    eventId: 'oce__emailtransaction__c-D0000000-0000-0000-0000-000000000000'
  };

  bridgeObject.sendSf(parsedICS).then(res => {
    t.pass("Sent successfully");
  }).catch(err => {
    t.fail('Failed send ics to SF');
  });
});
