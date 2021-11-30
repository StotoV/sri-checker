const assert = require('assert');
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
    const crossCrossOriginPort = 9617
    var originServer
    var crossOriginServer
    var crossCrossOriginServer
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

        crossCrossOriginServer = http.createServer(function (request, response) {
            var requestUrl = url.parse(request.url)    
            response.writeHead(200)
            fs.createReadStream(__dirname + requestUrl.pathname).pipe(response)
        }).listen(crossCrossOriginPort)       
    }),

    after(function() {
        originServer.close()
        crossOriginServer.close()
        crossCrossOriginServer.close()
    }),

    it('tests if all elements are correctly discovered', async function() {
        // Arrange
        // Act
        const out = await scrape(origin+'/assets/html/origin.html')

        // Assert
        var numLink = 0
        var numScript = 0
        for (const node of out) {
            switch (node.element) {
                case 'LINK':
                    numLink++
                    break
                case 'SCRIPT':
                    numScript++
                    break
                default:
                    assert(false)
                    break
            }
        }
        assert.equal(numLink, 10)
        assert.equal(numScript, 12)
        
    }).timeout(60000)
})
