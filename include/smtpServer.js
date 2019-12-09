const SmtpServer = require("smtp-server").SMTPServer;
const MailParser = require("mailparser").simpleParser;
const config = require('../config').config;
const bridge = require('./helper/bridge');
const icsParser = require('./helper/icsParser');
const log = require('../libs/log').log;

let customSMTPServer = function() {
    var self = this;
    log.info('Starting SMTP server...');
    const server = new SmtpServer({
        authOptional: true,
        onData(stream, session, callback) {
            var string = '';
            //stream.pipe(process.stdout); // print message to console
            stream.on('data',function(data){
                string += data.toString();
            });
            stream.on("end", () => {
                log.info('Stream finished.');
                self.process(string);
                callback(null, "Message queued");
            });
        }
    });

    server.listen(config.smtpServer.port);

    server.on('error', function (e)
    {
        log.info('Caught error: ' + e.message);
        log.info(e.stack);
    });

// Put a friendly message on the terminal
    log.info("Server running at port " + config.smtpServer.port);
};

customSMTPServer.prototype.process = function (stream) {
    MailParser(stream)
        .then(parsedMail => {
            log.debug(parsedMail);
            let parser = new icsParser();
            if (parsedMail.attachments !== undefined && parsedMail.attachments.length > 0) {
                let checksumArray = [];
                for (let i = 0; i < parsedMail.attachments.length; i++) {
                    let checksumValue = parsedMail.attachments[i].checksum;
                    log.debug('Checksum: ' + checksumValue);
                    if (checksumArray.includes(checksumValue)) {
                        log.debug('Duplicated: ' + checksumValue);
                        continue;
                    }
                    checksumArray.push(checksumValue);

                    let content = parsedMail.attachments[i].content.toString('utf8');
                    let event = parser.parseFirst(content);

                    log.debug('Event info: ');
                    log.debug(event);

                    let caldavBridge = new bridge();
                    let result = caldavBridge.send(content, event);
                    if (result) {
                        log.info('Attachment saved to DB');
                    } else {
                        log.info('Attachment ignored');
                    }
                }
            }
        })
        .catch(error => {
            log.info('Caught error: ' + error.message);
            log.info(error.stack);
        });
};
module.exports = customSMTPServer;
