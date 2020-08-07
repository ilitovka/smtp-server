let test = require('tape');

const di = require('../../di').di;
const sfApiObj = di.get('sf-api');

test('Calling sf-api', function (t) {
  t.plan(1);

  di.get('request').setCallback((params, callback) => {
    callback(undefined, { statusCode: 200 }, JSON.stringify({
      access_token: "access_token",
      instance_url: "instance_url",
      access_token_expiration: Date.now() + 3600,
      namespace_prefix: ""
    }));
  });

  sfApiObj.sendAttendeeStatuses({
    ORGID: '00DS0000003Eixf',
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
    di.get('request').setCallback(false);
  }).catch(err => {
    t.fail('Failed send attendees statuses: ' + JSON.stringify(err));
    di.get('request').setCallback(false);
  });
});
