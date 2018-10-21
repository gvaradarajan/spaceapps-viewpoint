const http = require('http');
const fs = require('fs');
const url = require('url');

const hostname = '127.0.0.1';
const port = 3000;

var static = require('node-static');
var fileServer = new static.Server('./dist', {indexFile: 'index.html'});

const server = http.createServer((req, res) => {

    const parsedUrl = url.parse(req.url);

    if (parsedUrl.pathname.includes('Aura_27')) {
        fs.readFile('./dist/assets/Aura_27.dae', function (err, data) {
            if (err) {
                res.statusCode = 500;
                res.end(`Error getting the file: ${err}.`);
            } else {
                res.setHeader('Content-type', 'application/xml');
                res.end(data);
            }
        });
    } else if (parsedUrl.pathname.includes('tex_01.psd')) {
        let pathname = 'NOT_FOUND';
        if (parsedUrl.pathname.includes('tex_01.psd.001')) {
            pathname = './dist/assets/tex_01.psd.001.jpg';
        } else {
            pathname = './dist/assets/tex_01.psd.004.jpg';
        }
        fs.readFile(pathname, function (err, data) {
            if (err) {
                res.statusCode = 500;
                res.end(`Error getting the file: ${err}.`);
            } else {
                res.setHeader('Content-type', 'image/jpeg');
                res.end(data);
            }
        });
    } else if (parsedUrl.pathname.includes('foil_')) {
        let pathname = 'NOT_FOUND';
        if (parsedUrl.pathname.includes('gold_ramp')) {
            pathname = './dist/assets/foil_n_gold_ramp.pn.000.png';
        } else if (parsedUrl.pathname.includes('silver_ramp')) {
            pathname = './dist/assets/foil_silver_ramp.pn.000.png';
        } else {
            pathname = './dist/assets/foil_n.pn.001.png';
        }
        fs.readFile(pathname, function (err, data) {
            if (err) {
                res.statusCode = 500;
                res.end(`Error getting the file: ${err}.`);
            } else {
                res.setHeader('Content-type', 'image/png');
                res.end(data);
            }
        });
    } else {
        req.addListener('end', function () {
            fileServer.serve(req, res);
        }).resume();
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});