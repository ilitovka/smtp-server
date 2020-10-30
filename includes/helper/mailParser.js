let MailParser = function (icsParser, logger, baseAdapter, googleAdapter, outlookAdapter) {
  this.logger = logger;

  this.adapters = {
    google: new googleAdapter(icsParser, logger),
    outlook: new outlookAdapter(icsParser, logger),
    def: new baseAdapter(icsParser, logger),
  };
};

/**
 * @param parsedMail {object}
 *
 * @return {Promise}
 * */
MailParser.prototype.parseAttachments = function (parsedMail) {
  return new Promise((resolve, reject) => {
    let adapter = this.getAdapterByMail(parsedMail);

    adapter.parseAttachment(parsedMail).then(result => {
      return resolve(result);
    }).catch(err => {
      return reject(err);
    });
  });
};

/**
 * @param parsedMail {object} parsed attachment
 * @return {object} BaseAdapter
 * */
MailParser.prototype.getAdapterByMail = function (parsedMail) {
  let adapter = this.adapters.def;

  for (let key in this.adapters) {
    if (this.adapters[key].checkMail(parsedMail)) {
      return this.adapters[key];
    }
  }

  return adapter;
};

module.exports = MailParser;
