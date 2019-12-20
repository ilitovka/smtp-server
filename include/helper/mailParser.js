const config = require('../../config').config;
const icsParser = require('./icsParser');
const log = require('../../libs/log').log;
const baseAdapter = require('../adapters/base');
const googleAdapter = require('../adapters/google');
const outlookAdapter = require('../adapters/outlook');

let MailParser = function() {
    this.parser = new icsParser();

    this.adapters = {
        google: new googleAdapter(),
        outlook: new outlookAdapter(),
        def: new baseAdapter(),
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
            reject(err);
        });
    });
};

/**
 * @param parsedMail {object} parsed attachment
 * @return {object} BaseAdapter
 * */
MailParser.prototype.getAdapterByMail = function(parsedMail) {
    let adapter = this.adapters.def;

    for (let key in this.adapters) {
        if (this.adapters[key].checkMail(parsedMail)) {
            return this.adapters[key];
        }
    }

    return adapter;
};

module.exports = MailParser;
