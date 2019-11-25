const SmtpServer = require("smtp-server").SMTPServer;
const MailParser = require("mailparser").simpleParser;
const config = require('../config').config;
const bridge = require('./helper/bridge');
const icsParser = require('./helper/icsParser');

let customSMTPServer = function() {
    const server = new SmtpServer({
        onData(stream, session, callback) {
            this.process(stream);
            stream.pipe(process.stdout); // print message to console
            stream.on("end", callback);
        }
    });

    server.listen(config.smtpServer.port);

    server.on('error', function (e)
    {
        console.log('Caught error: ' + e.message);
        console.log(e.stack);
    });

// Put a friendly message on the terminal
    console.log("Server running at port " + config.smtpServer.port);
};

customSMTPServer.prototype.process = function (stream) {
    MailParser(stream, options)
        .then(parsed => {
            var parser = new icsParser();
            var parsedAttachments = [];
            if (parsed.attachments !== undefined && parsed.attachments.length > 0) {
                for (var i = 0; i < parsed.attachments.length; i++) {
                    var attachment = parser.parse(parsed.attachments[i].content);

                    caldavBridge = new bridge();
                    caldavBridge.send(parsed.attachments[i], attachment);

                    parsedAttachments.push(attachment);
                }
            }
        })
        .catch(error => {
            console.log('Caught error: ' + error.message);
            console.log(error.stack);
        });
};
module.exports = customSMTPServer;
