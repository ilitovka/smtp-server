

const Bridge = function() {

};

Bridge.prototype.send = function (attachment, parsedICS) {
    if (parsedICS.UID === undefined) {
        return false;
    }


    return true;
};

module.exports = Bridge;
