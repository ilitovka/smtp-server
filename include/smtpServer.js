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
                log.debug('stream data: ' + data.toString());
            });
            stream.on("end", () => {
                log.info('Stream finished.');
                self.process(string);
                callback(null, "Message queued as abcdef");
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
                for (let i = 0; i < parsedMail.attachments.length; i++) {
                    let content = parsedMail.attachments[i].content.toString('utf8');
                    let attachment = parser.parse(content);

                    log.debug('Attachment info: ');
                    log.debug(attachment);

                    if (Object.keys(attachment).length > 0) {
                        for (let k in attachment) {
                            if (attachment.hasOwnProperty(k)) {
                                const event = attachment[k];
                                if (event.type === 'VEVENT') {
                                    log.info('Attachment parsed successfully');

                                    let caldavBridge = new bridge();
                                    let result = caldavBridge.send(content, event);
                                    if (result) {
                                        log.info('Attachment saved to DB');
                                    } else {
                                        log.info('Attachment ignored');
                                    }
                                }
                            } else {
                                log.info('Couldn\'t parse attachment object');
                            }
                        }
                    } else {
                        log.info('Couldn\'t parse attachment');
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
