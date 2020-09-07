var cb = false;

module.exports = function (params, callback) {
    if (cb) {
        cb(params, callback)
    } else if ( params.url && params.url === 'url/api/mappings' ) {
        callback(undefined, { statusCode: 200 }, '{"mappings": [{"EntityType": "Account", "AliasField": "a", "SFField": "a1"}]}');
    }
    else {
        callback(undefined, { statusCode: 200 }, '{"code":200,"message":"ok", "token":"some_token"}');
    }
};

module.exports.setCallback = function (callback) {
    cb = callback;
};
