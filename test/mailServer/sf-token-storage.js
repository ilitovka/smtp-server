let test = require('tape');
const di = require('../../di');
const tokenStorageObject = di.get('sf-token-storage');

test('Calling token storage', function (t) {
  t.plan(1);

  tokenStorageObject.getAccessTokenByOrgId('00DS0000003Eixf').then(res => {
    t.pass("Token received successfully");
  }).catch(err => {
    t.fail('Failed get token: ' + JSON.stringify(err.log));
  });
});
