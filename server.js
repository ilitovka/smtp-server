const SMTPServer = require("smtp-server").SMTPServer;

const server = new SMTPServer({
    onData(stream, session, callback) {
        stream.pipe(process.stdout); // print message to console
        stream.on("end", callback);
    }
});

server.listen(process.env.PORT || 465);

server.on('error', function (e)
{
    console.log('Caught error: ' + e.message);
    console.log(e.stack);
});

process.on('uncaughtException', function(err)
{
    console.log('Caught exception: ' + err.message);
    console.log(err.stack);
});

// Put a friendly message on the terminal
console.log("Server running at http://" + config.ip + ":" + process.env.PORT || config.port + "/");
