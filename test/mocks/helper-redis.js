
let RedisClient = function (di) {
  this.di = di;
};

RedisClient.prototype.hmset = function (key, field, value) {
  return '';
};

RedisClient.prototype.hget = function(key, field) {
  return new Promise((resolve, reject) => {
    try {
      resolve('{"tokenCrypted":"70d49f29a14e3ec354f8c764072c84cb:109cf42baaff176cce9b612a363e4022", "expire": "expire", "instance_url": "instance_url", "prefix": "prefix"}');
    } catch(e) {
      reject(e);
    }
  })
};

module.exports = RedisClient;
