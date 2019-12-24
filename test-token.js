const sfStorage = require('./include/sf-token-storage');
const sfApi = require('./include/sf-api');
const configService = require('./include/configService');
const log = require('./libs/log').log;
const moment = require('moment');

let token = '00D5D000000DEVV!AR4AQIAE57cBTOD5K0EZIrV1g9U5eFfgxTLk.bOO.Tf0sSTYZmGB2HBRMvhlAYG8qFDN4ynKKy6yoG0gMHQdhNS6iHRxLQV.';
let instanceUrl = 'https://ocedev3--staldykin.my.salesforce.com/';

function testConfigService() {
    try {
        let tokenStorageObject = new sfStorage();

        tokenStorageObject.getAccessTokenByOrgId('00D5D000000DEVV').then(res => {
            return res;
        }).catch(err => {
            log.debug('CS API error:');
            log.debug(err);
        });
    } catch (e) {
        log.debug('Catch error: ');
        log.debug(e.stack);
    }
}

function refreshAccessToken() {
    try {
        let configServiceObject = new configService();

        configServiceObject.refreshAccessToken('00D5D000000DEVV').then(res => {
            log.debug('CS API refreshAccessToken result:');
            log.debug(res);
            return res;
        }).catch(err => {
            log.debug('CS API refreshAccessToken error:');
            log.debug(err);
        });
    } catch (e) {
        log.debug('Catch error: ');
        log.debug(e.stack);
    }
}

function testSF() {
    try {
        let sfApiObj = new sfApi();

        sfApiObj.connect(tokenStorageObject.createToken(token, instanceUrl,moment().unix() + 8 * 3600));
        sfApiObj._sendAttendeeStatuses({attendees:[{EventId: "a3G5D000000B5bYUAS", attendee:"ihor.litovka@avenga.com", Decision:"Yes"}]})
            .then(res => {
                log.debug('SF API result (send attendees statuses):');
                log.debug(res);
            }).catch(err => {
                log.debug('SF API error:');
                log.debug(err);
            });

        log.debug('Send attendee status result: ');
        log.debug(result);
    } catch (e) {
        log.debug('Catch error: ');
        log.debug(e.stack);
    }
}

function sendInvite() {
    try {
        let sfApiObj = new sfApi();
        let tokenStorageObject = new sfStorage();

        sfApiObj.connect(tokenStorageObject.createToken(token, instanceUrl,moment().unix() + 8 * 3600));
        sfApiObj._sendInvite(['litovkaigor@gmail.com', 'ihor.litovka@avenga.com'])
            .then(res => {
                log.debug('SF API result:');
                log.debug(res);
            }).catch(err => {
                log.debug('SF API error:');
                log.debug(err);
            });
    } catch (e) {
        log.debug('Catch error: ');
        log.debug(e.stack);
    }
}

function sendAttendeeStatus() {
    try {
        let sfApiObj = new sfApi();

        sfApiObj.sendAttendeeStatuses({
            ORGID: '00D5D000000DEVVUA4',
            uid: 'a3G5D000000B5gEUAS',
            attendee:[
                {
                    val: "ihor.litovka@avenga.com",
                    params: {
                        PARTSTAT: "Yes"
                    }
                }
            ]
        }).then(res => {
            log.debug('SF API result (send attendees statuses):');
            log.debug(res);
        }).catch(err => {
            log.debug('SF API error:');
            log.debug(err);
        });
    } catch (e) {
        log.debug('Catch error: ');
        log.debug(e.stack);
    }
}

log.debug('Current timestamp:');
log.debug(moment().unix());

testConfigService();
//sendInvite();
//refreshAccessToken();
//a3G5D000000B5gEUAS
