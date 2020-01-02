let test = require('tape');
const configService = require('../../include/configService');

let configServiceObject = new configService();

test('Calling configService', function (t) {
  t.plan(1);

  configServiceObject.getAccessToken('00D5D000000DEVV').then(res => {
    t.pass("Token received successfully");
  }).catch(err => {
    t.fail('Failed get token');
  });
});
