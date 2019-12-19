const BaseAdapter = require('./base');

class GoogleAdapter extends BaseAdapter {
    checkMail(parsedMail) {

        return false;
    }
}

module.exports = GoogleAdapter;
