let test = require('tape');
const sfStorage = require('../../include/sf-token-storage');

test('Calling token storage', function (t) {
  t.plan(1);

  let tokenStorageObject = new sfStorage();

  tokenStorageObject.getAccessTokenByOrgId('00D5D000000DEVV').then(res => {
    t.pass("Token received successfully");
  }).catch(err => {
    t.fail('Failed get token');
  });
});
