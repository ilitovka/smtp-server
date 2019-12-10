const sfStorage = require('./include/sf-token-storage');
const sfApi = require('./include/sf-api');
const log = require('./libs/log').log;

function testConfigService() {
    try {
        let tokenStorageObject = new sfStorage();

        let token = tokenStorageObject.getAccessTokenByOrgId('00DS0000003Eixf');

        log.debug('Token: ');
        log.debug(token);
    } catch (e) {
        log.debug(e);
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
        log.debug(e);
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
        log.debug(e);
    }
}
//testSF();
//sendInvite();
//a3G5D000000B5bFUAS
