/*-----------------------------------------------------------------------------
 **
 ** - Fennel Card-/CalDAV -
 **
 ** Copyright 2014-16 by
 ** SwordLord - the coding crew - http://www.swordlord.com
 ** and contributing authors
 **
 ** This program is free software; you can redistribute it and/or modify it
 ** under the terms of the GNU Affero General Public License as published by the Free
 ** Software Foundation, either version 3 of the License, or (at your option)
 ** any later version.
 **
 ** This program is distributed in the hope that it will be useful, but WITHOUT
 ** ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 ** FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for
 ** more details.
 **
 ** You should have received a copy of the GNU Affero General Public License along
 ** with this program. If not, see <http://www.gnu.org/licenses/>.
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
var config = require('../config').config;
var authlib = require('../libs/authentication');
var http = require('http');
var url = require('url');
var log = require('../libs/log').log;
var handler = require('../libs/requesthandler');

var communication = require('../libs/communication');
var httpauth = require('http-auth');

var crossroads = require('crossroads');
crossroads.ignoreState = true;

var basic = httpauth.basic(
    {
        realm: "Fennel"
    }, function (username, password, callback)
    {
        authlib.checkLogin(basic, username, password, callback);
    }
);

/**
 * Called when the URL is not matched against any known/defined pattern
 * @param comm
 * @param path
 */
function onBypass(comm, path)
{
    log.info('URL unknown: ' + path);

    var res = comm.getRes();

    res.writeHead(500);
    res.write(comm.url + " is not known");
    res.end();
}

/**
 * Gets called when the / URL is hit
 * @param comm
 */
function onHitRoot(comm)
{
    log.debug("Called the root. Redirecting to /p/");

    comm.getRes().writeHead(302,
        {
            'Location': '/p/'
            //todo: add other headers here...?
        });
    comm.flushResponse();
}

function onHitHealth(comm) {
    log.debug("Called the health path.");

    comm.getRes().writeHead(200);
    comm.flushResponse();
}

function onHitWellKnown(comm, params)
{
    log.debug("Called .well-known URL for " + params + ". Redirecting to /p/");

    comm.getRes().writeHead(302,
        {
            'Location': '/p/'
            //todo: add other headers here...?
        });
    comm.flushResponse();
}

/**
 * Gets called when /p is hit
 * @param comm
 * @param params
 */
function onHitPrincipal(comm, params)
{
    comm.params = params;

    // check authorisation
    if(!comm.checkPermission(comm.getURL(), comm.getReq().method))
    {
        var res = comm.getRes();
        log.info("Request is denied to this user");
        res.writeHead(403);
        res.write("Request is denied to this user");
        return;
    }

    handler.handlePrincipal(comm);
}

/**
 * Gets called when /cal is hit
 * @param comm
 * @param username
 * @param cal
 * @param params
 */
function onHitCalendar(comm, username, cal, params)
{
    comm.username = username;
    comm.cal = cal;
    comm.params = params;

    // check authorisation
    if(!comm.checkPermission(comm.getURL(), comm.getReq().method))
    {
        var res = comm.getRes();
        log.info("Request is denied to this user");
        res.writeHead(403);
        res.write("Request is denied to this user");
        return;
    }

    handler.handleCalendar(comm);
}

/**
 * Gets called when /card is hit
 * @param comm
 * @param username
 * @param card
 * @param params
 */
function onHitCard(comm, username, card, params)
{
    comm.username = username;
    comm.card = card;
    comm.params = params;

    // check authorisation
    if(!comm.checkPermission(comm.getURL(), comm.getReq().method))
    {
        var res = comm.getRes();
        log.info("Request is denied to this user");
        res.writeHead(403);
        res.write("Request is denied to this user");
        return;
    }

    handler.handleCard(comm);
}

crossroads.addRoute('/p/:params*:', onHitPrincipal);
crossroads.addRoute('/cal/:username:/:cal:/:params*:', onHitCalendar);
crossroads.addRoute('/card/:username:/:card:/:params*:', onHitCard);
crossroads.addRoute('/.well-known/:params*:', onHitWellKnown);
crossroads.addRoute('/', onHitRoot);
crossroads.addRoute('/health', onHitHealth);
crossroads.bypassed.add(onBypass);

// start the server and process requests
let server = http.createServer(function (req, res)
{
    let nonAccessPages = ['/health'];
    let access = false;
    if (!nonAccessPages.includes(req.url)) {
        let auth = req.headers['authorization'];  // auth is in base64(username:password)  so we need to decode the base64

        if(!auth) {     // No Authorization header was passed in so it's the first time the browser hit us

            // Sending a 401 will require authentication, we need to send the 'WWW-Authenticate' to tell them the sort of authentication to use
            // Basic auth is quite literally the easiest and least secure, it simply gives back  base64( username + ":" + password ) from the browser
            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');

            res.end('<html><body>This is a secure area. Try reloading to login.');
        } else if(auth) {    // The Authorization was passed in so now we validate it

            let tmp = auth.split(' ');   // Split on a space, the original auth looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part

            let buf = Buffer.alloc(tmp[1], 'base64'); // create a buffer and tell it the data coming in is base64
            let plain_auth = buf.toString();        // read it back out as a string

            let creds = plain_auth.split(':');      // split on a ':'
            let username = creds[0];
            let password = creds[1];

            authlib.checkLogin(basic, username, password, (result) => {
                if (!result) {
                    res.statusCode = 401; // Force them to retry authentication
                    res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');

                    res.end('<html><body>Forbidden</body></html>');
                } else {
                    access = true;
                }
            });
        }
    } else {
        access = true;
    }
    if (access) {
        log.debug("Method: " + req.method + ", URL: " + req.url);

        // will contain the whole body submitted
        let reqBody = "";

        req.on('data', function (data)
        {
            reqBody += data.toString();
        });

        req.on('end',function()
        {
            var comm = new communication(req, res, reqBody);

            var sUrl = url.parse(req.url).pathname;
            log.debug("Request body: " + reqBody);
            crossroads.parse(sUrl, [comm]);
        });
    }
});

server.listen(process.env.PORT || config.port);

server.on('error', function (e)
{
    log.warn('Caught error: ' + e.message);
    log.debug(e.stack);
});

process.on('uncaughtException', function(err)
{
    log.warn('Caught exception: ' + err.message);
    log.debug(err.stack);
});

// Put a friendly message on the terminal
log.info("Server running at http://" + config.ip + ":" + (process.env.PORT || config.port) + "/");
