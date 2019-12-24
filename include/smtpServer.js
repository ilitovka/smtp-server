const SmtpServer = require("smtp-server").SMTPServer;
const MailParser = require("mailparser").simpleParser;
const config = require('../config').config;
const bridge = require('./helper/bridge');
const icsParser = require('./helper/icsParser');
const log = require('../libs/log').log;
const parse = require('./helper/mailParser');

/**
 * @constructor
 * */
let customSMTPServer = function () {
  let self = this;
  log.info('Starting SMTP server...');

  this.bridge = new bridge();
  this.parse = new parse();

  const server = new SmtpServer({
    authOptional: true,
    onData(stream, session, callback) {
      let string = '';
      //stream.pipe(process.stdout); // print message to console
      stream.on('data', function (data) {
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

  server.on('error', function (e) {
    log.info('Caught error: ' + e.message);
    log.info(e.stack);
  });

// Put a friendly message on the terminal
  log.info("Server running at port " + config.smtpServer.port);
};

/**
 * @param stream {string} Incoming mail
 * */
customSMTPServer.prototype.process = function (stream) {
  MailParser(stream)
    .then(parsedMail => {
      this.parse.parseAttachments(parsedMail).then(result => {
        //Send parsed ICS to caldav/SF
        log.info('Attachment saving to DB');
        this.bridge.send(result.content, result.event);
      }).catch(err => {
        log.debug('Attachment parse failed');
      });
    })
    .catch(error => {
      log.info('Caught error: ' + error.message);
      log.info(error.stack);
    });
};
module.exports = customSMTPServer;
