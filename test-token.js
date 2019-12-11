const sfStorage = require('./include/sf-token-storage');
const sfApi = require('./include/sf-api');
const configService = require('./include/configService');
const log = require('./libs/log').log;

function testConfigService() {
    try {
        let tokenStorageObject = new sfStorage();

        let token = tokenStorageObject.getAccessTokenByOrgId('00DS0000003Eixf').then(res => {
            log.debug('CS API result (getAccessTokenByOrgId):');
            log.debug(res);
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

        configServiceObject.refreshAccessToken('00DS0000003Eixf').then(res => {
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

        sfApiObj.connect('00D5D000000DEVV!AR4AQMDTKEBr_Ha75G2wUoyLIxrEn0bN0hG.cEw2Vdufvg3dTNbDPIkuL5GhZ.gieAn1sC1HVLeBcwbt5KXpApamuHfVJY8L');
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

        sfApiObj.connect('00D5D000000DEVV!AR4AQMDTKEBr_Ha75G2wUoyLIxrEn0bN0hG.cEw2Vdufvg3dTNbDPIkuL5GhZ.gieAn1sC1HVLeBcwbt5KXpApamuHfVJY8L');
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
            uid: 'a3G5D000000B5bYUAS',
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
//testSF();
//sendInvite();
//a3G5D000000B5bFUAS
//testConfigService();
sendAttendeeStatus();
//refreshAccessToken();
