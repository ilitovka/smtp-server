let fs = require("fs");

fs.createReadStream('config.json.dist').pipe(fs.createWriteStream('config.json'));