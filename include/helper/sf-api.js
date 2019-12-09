const log = require('../../libs/log').log;
const config = require('../config').config;
const jsforce = require('jsforce');
const request = require('request');

let sfApi = function() {
    let accessToken = null;
    let accessTokenExpire = 0;
    let instanceUrl = config.sfApi.endpoint;

    //let login = config.sfApi.login;
    //let password = config.sfApi.password;
};

sfApi.prototype.getAccessToken = function () {

};

sfApi.prototype.connect = function() {
    var jsforce = require('jsforce');
    /*conn.login('username@domain.com', 'password', function(err, res) {
        if (err) { return console.error(err); }
        conn.query('SELECT Id, Name FROM Account', function(err, res) {
            if (err) { return console.error(err); }
            console.log(res);
        });
    });*/
    let conn = new jsforce.Connection({
        // you can change loginUrl to connect to sandbox or prerelease env.
        // loginUrl : 'https://test.salesforce.com'
    });
};

sfApi.prototype.sendAttendeeStatuses = function(ics) {
    let path = '/services/apexrest/AttendeeStatuses/';

    // body payload structure is depending to the Apex REST method interface.
    let body = {
        ics: ics
    };
    conn.apex.post(path, body, function(err, res) {
        if (err) { return console.error(err); }
        console.log("response: ", res);
        // the response object structure depends on the definition of apex class
    });
};

module.exports = sfApi;
