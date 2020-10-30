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
try {
    let di = new require('./di');
    let config = di.get('config');
    let customSmtpServer = di.get('smtpServer');

    //run smtp server
    customSmtpServer.run();

    //run http server for monitoring service
    const express = require('express');
    const app = express();
    
    app.get('/health', (req, res) => {
        res.send('Ok');
    });

    app.listen(config.port, () => {
        console.log(`Monitoring endpoint running on port: ${config.port}`)
    })
} catch (e) {
    console.log('Caught error: ' + e.message);
    console.log(e.stack);
}
