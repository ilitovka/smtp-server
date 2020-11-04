/**
 * @param {Object} crypto - node build-in crypto library
 * @param {Object} config - project configurations
 * @constructor
 */
let CryptoHelper = function (crypto, config) {
  this.crypto = crypto;
  this.config = config;
};

/**
 * Encrypting string using symmetric encryption
 *
 * @param {String} text - string to encrypt
 * @param {String} secret - secret key
 * @return {String}
 */
CryptoHelper.prototype.encrypt = function (text, secret) {
  let iv = this.crypto.randomBytes(16);
  let algorithm = this.config.crypto.algorithm ? this.config.crypto.algorithm : 'aes-256-cbc';
  let cipher = this.crypto.createCipheriv(algorithm, Buffer.from(secret ? secret : this.config.crypto.key), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

/**
 * Decrypt string using symmetric encryption
 *
 * @param {String} text - encrypted string to decrypt
 * @param {String} secret - secret key
 * @return {String}
 */
CryptoHelper.prototype.decrypt = function (text, secret) {
  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let algorithm = this.config.crypto.algorithm ? this.config.crypto.algorithm : 'aes-256-cbc';
  let decipher = this.crypto.createDecipheriv(algorithm, Buffer.from(secret ? secret : this.config.crypto.key), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};

/**
 * Generate string
 *
 * @param {Number} byteLength - length of token in bytes
 * @return {Promise}
 */
CryptoHelper.prototype.generateToken = function (byteLength) {
  return new Promise((resolve, reject) => {
    this.crypto.randomBytes(byteLength, (err, buf) => {
      if (err) reject(err);
      resolve(buf.toString('hex'));
    });
  })
};

CryptoHelper.prototype.verifySignature = function (payload, clientSecret) {
  let hmac = this.crypto.createHmac("sha256", clientSecret);
  hmac.update(payload.id);
  hmac.update(payload.issued_at);

  return hmac.digest("base64") === payload.signature;
};

module.exports = CryptoHelper;
