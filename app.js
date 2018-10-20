const http = require('http');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;

var static = require('node-static');
var fileServer = new static.Server('./dist', {indexFile: 'index.html'});

const server = http.createServer((req, res) => {
    req.addListener('end', function () {
        fileServer.serve(req, res);
    }).resume();
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});