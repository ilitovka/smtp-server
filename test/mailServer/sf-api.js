let test = require('tape');
const sfApi = require('../../include/sf-api');

test('Calling sf-api', function (t) {
  t.plan(1);

  let sfApiObj = new sfApi();

  sfApiObj.sendAttendeeStatuses({
    ORGID: '00D5D000000DEVV',
    uid: 'a3G5D000000B5gEUAS',
    eventId: '',
    attendee:[
      {
          val: "ihor.litovka@avenga.com",
          params: {
              PARTSTAT: "Yes"
          }
      }
    ]
  }).then(res => {
    t.pass("SF API result (send attendees statuses)");
  }).catch(err => {
    t.fail('Failed send attendees statuses');
  });
});
