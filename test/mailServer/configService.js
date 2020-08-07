let test = require('tape');
let expect = require('chai').expect;
const di = require('../../di').di;
const configServiceObject = di.get('config-service');
const config  = di.get('config');
const Request = di.get('request');

const orgID = '00DS0000003Eixf';

test('Calling configService: getAccessToken success', function (t) {
  t.plan(1);


  Request.setCallback((params, callback) => {
    expect(params).to.deep.equal({
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': ' Bearer ' + config.configService.apiKey
      },
      url: config.configService.url + '/api/sf/token/' + orgID
    });

    callback(undefined, { statusCode: 200 }, JSON.stringify({
      access_token: "access_token",
      instance_url: "instance_url",
      access_token_expiration: "access_token_expiration",
      namespace_prefix: ""
    }));
  });

  configServiceObject.getAccessToken(orgID).then(res => {
    t.pass("Token received successfully");
    Request.setCallback(false);
  }).catch(err => {
    t.fail('Failed get token: ' + err.message);
    Request.setCallback(false);
  });
});
