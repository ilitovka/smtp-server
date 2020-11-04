/**
 * @constructor
 * */
let CustomSMTPServer = function (di) {
  this.di = di;
  this.bridgeSF = this.di.get('helper-sf-bridge');
  this.parse = this.di.get('helper-mail-parser');
  this.MailParser = this.di.get("mailparser").simpleParser;
  this.SmtpServer = this.di.get("smtp-server").SMTPServer;
  this.config = this.di.get('config');
  this.logger = this.di.get('logger');
};

CustomSMTPServer.prototype.run = function() {
  let self = this;

  this.logger.log('Starting SMTP server...');

  const server = new this.SmtpServer({
    authOptional: true,
    onData(stream, session, callback) {
      let string = '';
      //stream.pipe(process.stdout); // print message to console
      stream.on('data', function (data) {
        string += data.toString();
      });
      stream.on("end", () => {
        self.logger.log('Stream finished.');
        self.process(string).then((res) => {
          self.logger.log('Message processed.');
          self.logger.log(res);
        }).catch((err) => self.logger.error(err));
        callback(null, "Message queued");
      });
    }
  });

  server.listen(this.config.smtpServer.port);

  server.on('error', (e) => {
    this.logger.log('Caught error: ' + e.message);
    this.logger.log(e.stack);
  });

// Put a friendly message on the terminal
  this.logger.log("Server running at port " + this.config.smtpServer.port);
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
          this.logger.log('Attachment saving to SF');
          return this.bridgeSF.sendSf(result.event);
        }).catch(err => {
          this.logger.log('Attachment parse failed');

          return reject(err);
        }).finally((result) => {
          return resolve(result);
        });
      })
      .catch(error => {
        this.logger.log('Caught error: ' + error.message);
        this.logger.log(error.stack);

        return reject(error);
      });
  });
};

module.exports = CustomSMTPServer;
