const BaseAdapter = require('./base');

class OutlookAdapter extends BaseAdapter {
  checkMail(parsedMail) {
    return false;
  }
}

module.exports = OutlookAdapter;
