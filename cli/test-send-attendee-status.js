const di = require('../di');
const sfApiObj = di.get('sf-api');
const moment = di.get('moment');
const config = di.get('config');


function sendAttendeeStatus() {
    try {
        sfApiObj.sendAttendeeStatuses({
            ORGID: config.orgId || '00000000000000',
            uid: config.uid || 'a3G5D000000B5gEUAS',
            eventId: config.eventId || 'a3G5D000000B5gEUAS',
            attendee:[
                {
                    val: config.email || "ihor.litovka@avenga.com",
                    params: {
                        PARTSTAT: config.decision || "Yes"
                    }
                }
            ]
        }).then(res => {
            console.log('SF API result (send attendees statuses):');
            console.log(res);
        }).catch(err => {
            console.log('SF API error:');
            console.log(err);
        });
    } catch (e) {
        console.log('Catch error: ');
        console.log(e.stack);
    }
}

console.log('Current timestamp:');
console.log(moment().unix());

sendAttendeeStatus();
