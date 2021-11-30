const connect = require('connect');
const serveStatic = require('serve-static');
const http = require('http')
const url = require('url')
const fs = require('fs')

const index = require('../src/index.js')
const scrape = require('../src/scrape.js')

describe('', function() {
    const port = 9615
    const origin = 'http://127.0.0.1:' + port
    const crossOriginPort = 9616
    var originServer
    var crossOriginServer
    before(function() {
        originServer = http.createServer(function (request, response) {
            var requestUrl = url.parse(request.url)    
            response.writeHead(200)
            fs.createReadStream(__dirname + requestUrl.pathname).pipe(response)
        }).listen(port)       

        crossOriginServer = http.createServer(function (request, response) {
            var requestUrl = url.parse(request.url)    
            response.writeHead(200)
            fs.createReadStream(__dirname + requestUrl.pathname).pipe(response)
        }).listen(crossOriginPort)       
    }),

    after(function() {
        originServer.close()
        crossOriginServer.close()
    }),

    it('', async function() {
        const out = await scrape(origin+'/assets/html/script_link_integrity.html')
    }).timeout(60000)
})
