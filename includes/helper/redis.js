
let RedisClient = function (di) {
  this.di = di;
  this.redis = this.di.get("redis");
  this.client = this.redis.createClient({
    url: di.get('config').redis.endpoint
  });
  this.logger = this.di.get('logger');

  this.client.on("ready", (error) => {
    this.logger.log(`Connected to redis host: ${di.get('config').redis.endpoint}`);
  });

  
  this.client.on("error", (error) => {
    this.logger.error(error);
  });

};

RedisClient.prototype.set = function (key, value) {
  this.client.set(key, value, this.redis.print);
};

RedisClient.prototype.get = function (key) {
  this.client.get(key, this.redis.print);
};

RedisClient.prototype.hmset = function (key, field, value) {
  this.client.hmset(key, field, value);
};

RedisClient.prototype.hget = function(key, field) {
  return new Promise((resolve, reject) => {
    try {
      this.client.hget(key, field, function (err, obj) {
        resolve(obj);
      });
    } catch(e) {
      reject(e);
    }
  })
};

RedisClient.prototype.ping = function() {
  return new Promise((resolve, reject) => {
    try {
      if (!this.client.connected) {
        return reject(false);
      }
      this.client.ping(function (err, obj) {
        resolve(obj);
      });
    } catch(e) {
      reject(e);
    }
  })
};

module.exports = RedisClient;
