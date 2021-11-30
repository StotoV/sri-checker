const assert = require('assert');
const connect = require('connect');
const serveStatic = require('serve-static');
const http = require('http')
const url = require('url')
const fs = require('fs')

const index = require('../src/index.js')
const scrape = require('../src/scrape.js')

describe('Scraper tests', function() {
    const port = 9615
    const origin = 'http://127.0.0.1:' + port
    const crossOriginPort = 9616
    const crossCrossOriginPort = 9617
    var originServer
    var crossOriginServer
    var crossCrossOriginServer
    before(function() {
        const serverFunction = function(request, response) {
            var requestUrl = url.parse(request.url)    
            response.setHeader('Access-Control-Allow-Origin', '*');
            response.setHeader('Access-Control-Request-Method', '*');
            response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
            response.setHeader('Access-Control-Allow-Headers', '*');
            response.writeHead(200)
            fs.createReadStream(__dirname + requestUrl.pathname).pipe(response)
        }

        originServer = http.createServer(serverFunction).listen(port)       
        crossOriginServer = http.createServer(serverFunction).listen(crossOriginPort)       
        crossCrossOriginServer = http.createServer(serverFunction).listen(crossCrossOriginPort)       
    }),

    after(function() {
        originServer.close()
        crossOriginServer.close()
        crossCrossOriginServer.close()
    })

    // it('tests if all elements are correctly discovered', async function() {
    //     // Arrange
    //     // Act
    //     const out = await scrape(origin+'/assets/html/origin.html')
    //
    //     // Assert
    //     var numLink = 0
    //     var numScript = 0
    //     for (const node of out) {
    //         switch (node.element) {
    //             case 'LINK':
    //                 numLink++
    //                 break
    //             case 'SCRIPT':
    //                 numScript++
    //                 break
    //             default:
    //                 assert(false)
    //                 break
    //         }
    //     }
    //     assert.equal(numLink, 12)
    //     assert.equal(numScript, 14)
    // }).timeout(60000),

    // it('tests wrong SRI tags getting a network error', async function() {
    //     // Arrange
    //     // Act
    //     const out = await scrape(origin+'/assets/html/wrong_sri.html')
    //
    //     // Assert
    // }).timeout(60000)
})
