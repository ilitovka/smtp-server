
const log = require('../libs/log').log;

/**
 * @constructor
 * */
let CustomSMTPServer = function (di) {
  this.di = di;
  this.bridge = this.di.get('helper-caldav-bridge');
  this.bridgeSF = this.di.get('helper-sf-bridge');
  this.parse = this.di.get('helper-mail-parser');
  this.MailParser = this.di.get("mailparser").simpleParser;
  this.SmtpServer = this.di.get("smtp-server").SMTPServer;
  this.config = this.di.get('config');

};

CustomSMTPServer.prototype.run = function() {
  let self = this;

  log.info('Starting SMTP server...');

  const server = new this.SmtpServer({
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

  server.listen(this.config.smtpServer.port);

  server.on('error', function (e) {
    log.info('Caught error: ' + e.message);
    log.info(e.stack);
  });

// Put a friendly message on the terminal
  log.info("Server running at port " + this.config.smtpServer.port);
};

/**
 * @param stream {string} Incoming mail
 * @return {Promise}
 * */
CustomSMTPServer.prototype.process = function (stream) {
  return new Promise((resolve, reject) => {
    this.MailParser(stream)
      .then(parsedMail => {
        this.parse.parseAttachments(parsedMail).then(result => {
          //Send parsed ICS to caldav/SF
          log.info('Attachment saving to DB');
          return this.bridge.send(result.content, result.event);
        }).then(result => {
          return this.bridgeSF.sendSf(result);
        }).catch(err => {
          log.debug('Attachment parse failed');

          return reject(err);
        }).finally((result) => {
          return resolve(result);
        });
      })
      .catch(error => {
        log.info('Caught error: ' + error.message);
        log.info(error.stack);

        return reject(error);
      });
  });
};

module.exports = CustomSMTPServer;
