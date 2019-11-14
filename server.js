const SMTPServer = require("smtp-server").SMTPServer;

const server = new SMTPServer({
    onData(stream, session, callback) {
        stream.pipe(process.stdout); // print message to console
        stream.on("end", callback);
    }
});

server.listen(465);
