/*-----------------------------------------------------------------------------
 **
 ** - Fennel Card-/CalDAV -
 **
 ** Copyright 2014-17 by
 ** SwordLord - the coding crew - http://www.swordlord.com
 ** and contributing authors
 **
 ** This program is free software; you can redistribute it and/or modify it
 ** under the terms of the GNU Affero General Public License as published by the
 ** Free Software Foundation, either version 3 of the License, or (at your
 ** option) any later version.
 **
 ** This program is distributed in the hope that it will be useful, but WITHOUT
 ** ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 ** FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for
 ** more details.
 **
 ** You should have received a copy of the GNU Affero General Public License
 ** along with this program. If not, see <http://www.gnu.org/licenses/>.
 **
 **-----------------------------------------------------------------------------
 **
 ** Original Authors:
 ** LordEidi@swordlord.com
 ** LordLightningBolt@swordlord.com
 **
 ** $Id:
 **
 -----------------------------------------------------------------------------*/

// Place all your configuration options here
//init .env variables
require('dotenv').config();

var config =
  {
    version_nr: '0.1.0',

    // Server specific configuration
    // Please use a proxy in front of Fennel to support TLS.
    // We suggest you use nginx as the TLS endpoint
    port: 8888,
    //port: 80,
    ip: '127.0.0.1',
    //ip: '0.0.0.0',
    type: process.env.type !== undefined ? process.env.type : 'test',

    // db specific configuration. you can use whatever sequelize supports.
    db_name: process.env.DB_NAME !== undefined ? process.env.DB_NAME : 'fennel',
    db_uid: process.env.DB_USER !== undefined ? process.env.DB_USER : 'root',
    db_pwd: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
    db_dialect: process.env.DB_TYPE !== undefined ? process.env.DB_TYPE : 'postgres',
    db_logging: true,
    db_ssl: process.env.DB_SSL !== undefined && process.env.DB_SSL == "1" ? true : false,
    //db_storage: 'fennel.sqlite',
    db_host: process.env.DB_HOST !== undefined ? process.env.DB_HOST : 'localhost', // For myql, postgres etc.

    // Authentication
    // Authentication methods so far: courier, htaccess, ldap
    auth_method: 'htaccess',
    auth_method_courier_socket: '/var/run/courier/authdaemon/socket',
    auth_method_htaccess_file: 'demouser.htaccess',

    // ldap authentication requires the ldapjs@1.0.0 node module. Please install manually
    auth_method_ldap_url: 'ldap://localhost:3002',
    auth_method_ldap_user_base_dn: 'ou=users,dc=example',


    // Authorisation
    // Authorisation Rules:
    // This property takes an array of Shiro formatted strings. Users are
    // only permitted access to resources when said access is explicitly
    // allowed here. Please see http://shiro.apache.org/permissions.html
    // for a short introduction to Shiro Syntax.
    //
    // Fennel uses the URL + the function to check for authorisation.
    // /card/demo/default/card_id.vcf with method PUT will become
    // card:demo:default:card_id.vcf:put
    //
    // Please note that $username is not recognised by shiro-trie but
    // will be replaced by Fennel with the current user when loaded into
    // the current process.
    //
    // The current set will allow the owner to access his or her own stuff
    authorisation: [
      'cal:$username:*',
      'card:$username:*',
      'p:options,report,propfind',
      'p:$username:*'
    ],

    test_user_name: 'demo',
    test_user_pwd: 'demo',

    smtpServer: {
      port: process.env.SMTP_PORT !== undefined ? process.env.SMTP_PORT : 25,
    },
    sfApi: {
      endpoint: process.env.SFAPI_ENDPOINT || '',
      accessToken: process.env.SFAPI_ACCESSTOKEN || '',
      orgID: process.env.SFAPI_ORGID || '',
      defaultNamespace: process.env.SFAPI_NAMESPACE || '',
    },
    configService: {
      apiKey: process.env.CONFIG_SERVICE_API_KEY !== undefined ? process.env.CONFIG_SERVICE_API_KEY : '',
      url: process.env.CONFIG_SERVICE_URL !== undefined ? process.env.CONFIG_SERVICE_URL : '',
      defaultLifetime: process.env.ACCESS_TOKEN_DEFAULT_LIFETIME !== undefined ? process.env.ACCESS_TOKEN_DEFAULT_LIFETIME : 300,
    },
    crypto: {
      algorithm: process.env.CRYPTO_ALGORITHM !== undefined ? process.env.CRYPTO_ALGORITHM : 'aes-256-cbc',
      key: process.env.CRYPTO_KEY !== undefined ? process.env.CRYPTO_KEY : ''
    },
    mode: process.env.MODE !== undefined ? process.env.MODE : 'sandbox'
  };

// Exporting.
module.exports = {
  config: config
};
