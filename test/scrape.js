const assert = require('assert');
const connect = require('connect');
const serveStatic = require('serve-static');
const http = require('http')
const url = require('url')
const fs = require('fs')

const index = require('../src/index.js')
const scrape = require('../src/scrape.js')

function stripFluidFields(result) {
    const out = result.map(x => Object.assign({}, x))

    for (var i=0;i<out.length;i++) {
        for (var j=0;j<out[i].requests.length;j++) {
            delete out[i].requests[j].time
        }

        for (var j=0;j<out[i].logs.length;j++) {
            delete out[i].logs[j].timestamp
            delete out[i].logs[j].networkRequestId
        }
    }

    return out
}

// @TODO localtest.me
// @TODO swap http to https

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
    })

    after(function() {
        originServer.close()
        crossOriginServer.close()
        crossCrossOriginServer.close()
    })

    it('tests valid cross origin request', async function() {
        // Arrange
        const expectedResult = [
            {
                target: 'http://127.0.0.1:9615/assets/html/cross_origin.html',
                element: 'SCRIPT',
                document: 'http://127.0.0.1:9615/assets/html/cross_origin.html',
                attributes: {
                    src: 'http://127.0.0.1:9616/assets/js/some_script.js'
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9616/assets/js/some_script.js",
                        "method": "GET",
                        "type": "Script",
                        "status": 200,
                        "size": 316,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "failureReason": undefined,
                        "remoteIPAddress": "127.0.0.1",
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "b5ce71442f5678d8e54851c832579318c2d139b1582aa7b5bdd6c482f1e26121",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/cross_origin.html"
                        ]
                    }
                ],
                logs: []
            },
            {
                target: 'http://127.0.0.1:9615/assets/html/cross_origin.html',
                element: 'LINK',
                document: 'http://127.0.0.1:9615/assets/html/cross_origin.html',
                attributes: {
                    rel: 'stylesheet',
                    href: 'http://127.0.0.1:9616/assets/css/some_css.css'
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9616/assets/css/some_css.css",
                        "method": "GET",
                        "type": "Stylesheet",
                        "status": 200,
                        "size": 316,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "failureReason": undefined,
                        "remoteIPAddress": "127.0.0.1",
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "5ce2d1b9aca15041314794941fd346ea2e6d361060174de6102691a7341e80f2",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/cross_origin.html"
                        ]
                    }
                ],
                logs: []
            }
        ]

        // Act
        var result = await scrape(origin+'/assets/html/cross_origin.html')
        result = stripFluidFields(result)

        // Assert
        assert.deepEqual(result, expectedResult)
    }).timeout(60000),

    it('tests valid cross origin request with valid integrity', async function() {
        // Arrange
        const expectedResult = [
            {
                target: 'http://127.0.0.1:9615/assets/html/cross_origin_integrity.html',
                element: 'SCRIPT',
                document: 'http://127.0.0.1:9615/assets/html/cross_origin_integrity.html',
                attributes: {
                    integrity: "sha384-OTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT",
                    src: 'http://127.0.0.1:9616/assets/js/some_script.js'
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9616/assets/js/some_script.js",
                        "method": "GET",
                        "type": "Script",
                        "status": 200,
                        "size": 316,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "failureReason": undefined,
                        "remoteIPAddress": "127.0.0.1",
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "b5ce71442f5678d8e54851c832579318c2d139b1582aa7b5bdd6c482f1e26121",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/cross_origin_integrity.html"
                        ]
                    }
                ],
                logs: [
                    {
                        "source": "security",
                        "level": "error",
                        "text": "Subresource Integrity: The resource 'http://127.0.0.1:9616/assets/js/some_script.js' has an integrity attribute, but the resource requires the request to be CORS enabled to check the integrity, and it is not. The resource has been blocked because the integrity cannot be enforced.",
                        "url": "http://127.0.0.1:9615/assets/html/cross_origin_integrity.html"
                    }
                ]
            },
            {
                target: 'http://127.0.0.1:9615/assets/html/cross_origin_integrity.html',
                element: "LINK",
                document: 'http://127.0.0.1:9615/assets/html/cross_origin_integrity.html',
                attributes: {
                    integrity: "sha384-Iw54E1Wcqvl8hgVdh49U+WwaGqHp5YstLOVgpoFxv7pT4Lm36Cce7hQ4ZfeXY9wN",
                    rel: "stylesheet",
                    href: "http://127.0.0.1:9616/assets/css/some_css.css"
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9616/assets/css/some_css.css",
                        "method": "GET",
                        "type": "Stylesheet",
                        "status": 200,
                        "size": 316,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "failureReason": undefined,
                        "remoteIPAddress": "127.0.0.1",
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "5ce2d1b9aca15041314794941fd346ea2e6d361060174de6102691a7341e80f2",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/cross_origin_integrity.html"
                        ]
                    }
                ],
                logs: [
                    {
                        "source": "security",
                        "level": "error",
                        "text": "Subresource Integrity: The resource 'http://127.0.0.1:9616/assets/css/some_css.css' has an integrity attribute, but the resource requires the request to be CORS enabled to check the integrity, and it is not. The resource has been blocked because the integrity cannot be enforced.",
                        "url": "http://127.0.0.1:9615/assets/html/cross_origin_integrity.html"
                    }
                ]
            }
        ]

        // Act
        var result = await scrape(origin+'/assets/html/cross_origin_integrity.html')
        result = stripFluidFields(result)

        // Assert
        assert.deepEqual(result, expectedResult)
    }).timeout(60000),

    it('tests valid cross origin request with valid integrity and crossorigin', async function() {
        // Arrange
        const expectedResult = [
            {
                target: 'http://127.0.0.1:9615/assets/html/cross_origin_integrity_crossorigin.html',
                element: 'SCRIPT',
                document: 'http://127.0.0.1:9615/assets/html/cross_origin_integrity_crossorigin.html',
                attributes: {
                    integrity: "sha384-OTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT",
                    crossorigin: "anonymous",
                    src: 'http://127.0.0.1:9616/assets/js/some_script.js'
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9616/assets/js/some_script.js",
                        "method": "GET",
                        "type": "Script",
                        "status": 200,
                        "size": 316,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "failureReason": undefined,
                        "remoteIPAddress": "127.0.0.1",
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "b5ce71442f5678d8e54851c832579318c2d139b1582aa7b5bdd6c482f1e26121",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/cross_origin_integrity_crossorigin.html"
                        ]
                    }
                ],
                logs: []
            },
            {
                target: 'http://127.0.0.1:9615/assets/html/cross_origin_integrity_crossorigin.html',
                element: "LINK",
                document: 'http://127.0.0.1:9615/assets/html/cross_origin_integrity_crossorigin.html',
                attributes: {
                    integrity: "sha384-Iw54E1Wcqvl8hgVdh49U+WwaGqHp5YstLOVgpoFxv7pT4Lm36Cce7hQ4ZfeXY9wN",
                    crossorigin: "anonymous",
                    rel: "stylesheet",
                    href: "http://127.0.0.1:9616/assets/css/some_css.css"
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9616/assets/css/some_css.css",
                        "method": "GET",
                        "type": "Stylesheet",
                        "status": 200,
                        "size": 316,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "failureReason": undefined,
                        "remoteIPAddress": "127.0.0.1",
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "5ce2d1b9aca15041314794941fd346ea2e6d361060174de6102691a7341e80f2",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/cross_origin_integrity_crossorigin.html"
                        ]
                    }
                ],
                logs: []
            }
        ]

        // Act
        var result = await scrape(origin+'/assets/html/cross_origin_integrity_crossorigin.html')
        result = stripFluidFields(result)

        // Assert
        assert.deepEqual(result, expectedResult)
    }).timeout(60000),

    it('tests valid cross origin request with valid integrity and invalid crossorigin', async function() {
        // Arrange
        const expectedResult = [
            {
                target: 'http://127.0.0.1:9615/assets/html/cross_origin_integrity_invalid_crossorigin.html',
                element: 'SCRIPT',
                document: 'http://127.0.0.1:9615/assets/html/cross_origin_integrity_invalid_crossorigin.html',
                attributes: {
                    integrity: "sha384-OTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT",
                    crossorigin: "use-credentials",
                    src: 'http://127.0.0.1:9616/assets/js/some_script.js'
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9616/assets/js/some_script.js",
                        "method": "GET",
                        "type": "Script",
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "remoteIPAddress": undefined,
                        "size": undefined,
                        "status": undefined,
                        "responseBodyHash": null,
                        "failureReason": "net::ERR_FAILED",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/cross_origin_integrity_invalid_crossorigin.html"
                        ]
                    }
                ],
                logs: [
                    {
                        "source": "javascript",
                        "level": "error",
                        "text": "Access to script at 'http://127.0.0.1:9616/assets/js/some_script.js' from origin 'http://127.0.0.1:9615' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.",
                        "category": "cors",
                        "url": "http://127.0.0.1:9615/assets/html/cross_origin_integrity_invalid_crossorigin.html"
                    },
                    {
                        "source": "network",
                        "level": "error",
                        "text": "Failed to load resource: net::ERR_FAILED",
                        "category": "cors",
                        "url": "http://127.0.0.1:9616/assets/js/some_script.js"
                    }
                ]
            },
            {
                target: 'http://127.0.0.1:9615/assets/html/cross_origin_integrity_invalid_crossorigin.html',
                element: "LINK",
                document: 'http://127.0.0.1:9615/assets/html/cross_origin_integrity_invalid_crossorigin.html',
                attributes: {
                    integrity: "sha384-Iw54E1Wcqvl8hgVdh49U+WwaGqHp5YstLOVgpoFxv7pT4Lm36Cce7hQ4ZfeXY9wN",
                    crossorigin: "use-credentials",
                    rel: "stylesheet",
                    href: "http://127.0.0.1:9616/assets/css/some_css.css"
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9616/assets/css/some_css.css",
                        "method": "GET",
                        "type": "Stylesheet",
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "remoteIPAddress": undefined,
                        "size": undefined,
                        "status": undefined,
                        "responseBodyHash": null,
                        "failureReason": "net::ERR_FAILED",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/cross_origin_integrity_invalid_crossorigin.html"
                        ]
                    }
                ],
                logs: [
                    {
                        "source": "javascript",
                        "level": "error",
                        "text": "Access to CSS stylesheet at 'http://127.0.0.1:9616/assets/css/some_css.css' from origin 'http://127.0.0.1:9615' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.",
                        "category": "cors",
                        "url": "http://127.0.0.1:9615/assets/html/cross_origin_integrity_invalid_crossorigin.html"
                    },
                    {
                        "source": "network",
                        "level": "error",
                        "text": "Failed to load resource: net::ERR_FAILED",
                        "category": "cors",
                        "url": "http://127.0.0.1:9616/assets/css/some_css.css"
                    }
                ]
            }
        ]

        // Act
        var result = await scrape(origin+'/assets/html/cross_origin_integrity_invalid_crossorigin.html')
        result = stripFluidFields(result)

        // Assert
        assert.deepStrictEqual(result, expectedResult)

    }).timeout(60000),

    it('tests valid cross origin request with invalid integrity and valid crossorigin', async function() {
        // Arrange
        const expectedResult = [
            {
                target: 'http://127.0.0.1:9615/assets/html/cross_origin_invalid_integrity_crossorigin.html',
                element: 'SCRIPT',
                document: 'http://127.0.0.1:9615/assets/html/cross_origin_invalid_integrity_crossorigin.html',
                attributes: {
                    integrity: "sha384-xTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT",
                    crossorigin: "anonymous",
                    src: 'http://127.0.0.1:9616/assets/js/some_script.js'
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9616/assets/js/some_script.js",
                        "method": "GET",
                        "type": "Script",
                        "status": 200,
                        "size": 316,
                        "remoteIPAddress": "127.0.0.1",
                        "failureReason": undefined,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "b5ce71442f5678d8e54851c832579318c2d139b1582aa7b5bdd6c482f1e26121",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/cross_origin_invalid_integrity_crossorigin.html"
                        ]
                    }
                ],
                logs: [
                    {
                        "source": "security",
                        "level": "error",
                        "text": "Failed to find a valid digest in the 'integrity' attribute for resource 'http://127.0.0.1:9616/assets/js/some_script.js' with computed SHA-384 integrity 'OTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT'. The resource has been blocked.",
                        "url": "http://127.0.0.1:9615/assets/html/cross_origin_invalid_integrity_crossorigin.html"
                    }
                ]
            },
            {
                target: 'http://127.0.0.1:9615/assets/html/cross_origin_invalid_integrity_crossorigin.html',
                element: "LINK",
                document: 'http://127.0.0.1:9615/assets/html/cross_origin_invalid_integrity_crossorigin.html',
                attributes: {
                    integrity: "sha384-xw54E1Wcqvl8hgVdh49U+WwaGqHp5YstLOVgpoFxv7pT4Lm36Cce7hQ4ZfeXY9wN",
                    crossorigin: "anonymous",
                    rel: "stylesheet",
                    href: "http://127.0.0.1:9616/assets/css/some_css.css"
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9616/assets/css/some_css.css",
                        "method": "GET",
                        "type": "Stylesheet",
                        "status": 200,
                        "size": 316,
                        "remoteIPAddress": "127.0.0.1",
                        "failureReason": undefined,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "5ce2d1b9aca15041314794941fd346ea2e6d361060174de6102691a7341e80f2",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/cross_origin_invalid_integrity_crossorigin.html"
                        ]
                    }
                ],
                logs: [
                    {
                        "source": "security",
                        "level": "error",
                        "text": "Failed to find a valid digest in the 'integrity' attribute for resource 'http://127.0.0.1:9616/assets/css/some_css.css' with computed SHA-384 integrity 'Iw54E1Wcqvl8hgVdh49U+WwaGqHp5YstLOVgpoFxv7pT4Lm36Cce7hQ4ZfeXY9wN'. The resource has been blocked.",
                        "url": "http://127.0.0.1:9615/assets/html/cross_origin_invalid_integrity_crossorigin.html"
                    }
                ]
            }
        ]

        // Act
        var result = await scrape(origin+'/assets/html/cross_origin_invalid_integrity_crossorigin.html')
        result = stripFluidFields(result)

        // Assert
        assert.deepStrictEqual(result, expectedResult)


    }).timeout(60000),

    // @TODO: Mismatch between script and link
    it('tests valid cross origin request with non supported integrity and valid crossorigin', async function() {
        // Arrange
        const expectedResult = [
            {
                target: 'http://127.0.0.1:9615/assets/html/cross_origin_non_supported_integrity_crossorigin.html',
                element: 'SCRIPT',
                document: 'http://127.0.0.1:9615/assets/html/cross_origin_non_supported_integrity_crossorigin.html',
                attributes: {
                    integrity: "md5-zf2SihmB+NZWAJzQNUUV+Q==",
                    crossorigin: "anonymous",
                    src: 'http://127.0.0.1:9616/assets/js/some_script.js'
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9616/assets/js/some_script.js",
                        "method": "GET",
                        "type": "Script",
                        "status": 200,
                        "size": 316,
                        "remoteIPAddress": "127.0.0.1",
                        "failureReason": undefined,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "b5ce71442f5678d8e54851c832579318c2d139b1582aa7b5bdd6c482f1e26121",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/cross_origin_non_supported_integrity_crossorigin.html"
                        ]
                    }
                ],
                logs: [
                    {
                        "source": "security",
                        "level": "error",
                        "text": "Error parsing 'integrity' attribute ('md5-zf2SihmB+NZWAJzQNUUV+Q=='). The specified hash algorithm must be one of 'sha256', 'sha384', or 'sha512'.",
                        "url": "http://127.0.0.1:9615/assets/html/cross_origin_non_supported_integrity_crossorigin.html"
                    }
                ]
            },
            {
                target: 'http://127.0.0.1:9615/assets/html/cross_origin_non_supported_integrity_crossorigin.html',
                element: "LINK",
                document: 'http://127.0.0.1:9615/assets/html/cross_origin_non_supported_integrity_crossorigin.html',
                attributes: {
                    integrity: "md5-Dc4rWS40Cc9c/BMOnCSA6w==",
                    crossorigin: "anonymous",
                    rel: "stylesheet",
                    href: "http://127.0.0.1:9616/assets/css/some_css.css"
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9616/assets/css/some_css.css",
                        "method": "GET",
                        "type": "Stylesheet",
                        "status": 200,
                        "size": 316,
                        "remoteIPAddress": "127.0.0.1",
                        "failureReason": undefined,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "5ce2d1b9aca15041314794941fd346ea2e6d361060174de6102691a7341e80f2",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/cross_origin_non_supported_integrity_crossorigin.html"
                        ]
                    }
                ],
                logs: []
            }
        ]

        // Act
        var result = await scrape(origin+'/assets/html/cross_origin_non_supported_integrity_crossorigin.html')
        result = stripFluidFields(result)

        // Assert
        assert.deepStrictEqual(result, expectedResult)


    }).timeout(60000),

    // @TODO: Mismatch between script and link
    it('tests valid cross origin request with malformed integrity and valid crossorigin', async function() {
        // Arrange
        const expectedResult = [
            {
                target: 'http://127.0.0.1:9615/assets/html/cross_origin_malformed_integrity_crossorigin.html',
                element: 'SCRIPT',
                document: 'http://127.0.0.1:9615/assets/html/cross_origin_malformed_integrity_crossorigin.html',
                attributes: {
                    integrity: "zf2SihmB+NZWAJzQNUUV+Q==",
                    crossorigin: "anonymous",
                    src: 'http://127.0.0.1:9616/assets/js/some_script.js'
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9616/assets/js/some_script.js",
                        "method": "GET",
                        "type": "Script",
                        "status": 200,
                        "size": 316,
                        "remoteIPAddress": "127.0.0.1",
                        "failureReason": undefined,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "b5ce71442f5678d8e54851c832579318c2d139b1582aa7b5bdd6c482f1e26121",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/cross_origin_malformed_integrity_crossorigin.html"
                        ]
                    }
                ],
                logs: [
                    {
                        "source": "security",
                        "level": "error",
                        "text": "Error parsing 'integrity' attribute ('zf2SihmB+NZWAJzQNUUV+Q=='). The hash algorithm must be one of 'sha256', 'sha384', or 'sha512', followed by a '-' character.",
                        "url": "http://127.0.0.1:9615/assets/html/cross_origin_malformed_integrity_crossorigin.html"
                    }
                ]
            },
            {
                target: 'http://127.0.0.1:9615/assets/html/cross_origin_malformed_integrity_crossorigin.html',
                element: "LINK",
                document: 'http://127.0.0.1:9615/assets/html/cross_origin_malformed_integrity_crossorigin.html',
                attributes: {
                    integrity: "Dc4rWS40Cc9c/BMOnCSA6w==",
                    crossorigin: "anonymous",
                    rel: "stylesheet",
                    href: "http://127.0.0.1:9616/assets/css/some_css.css"
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9616/assets/css/some_css.css",
                        "method": "GET",
                        "type": "Stylesheet",
                        "status": 200,
                        "size": 316,
                        "remoteIPAddress": "127.0.0.1",
                        "failureReason": undefined,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "5ce2d1b9aca15041314794941fd346ea2e6d361060174de6102691a7341e80f2",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/cross_origin_malformed_integrity_crossorigin.html"
                        ]
                    }
                ],
                logs: []
            }
        ]

        // Act
        var result = await scrape(origin+'/assets/html/cross_origin_malformed_integrity_crossorigin.html')
        result = stripFluidFields(result)

        // Assert
        assert.deepStrictEqual(result, expectedResult)


    }).timeout(60000)

    it('tests valid cross origin request with multiple valid integrity and valid crossorigin', async function() {
        // Arrange
        const expectedResult = [
            {
                target: 'http://127.0.0.1:9615/assets/html/cross_origin_multiple_integrity_crossorigin.html',
                element: 'SCRIPT',
                document: 'http://127.0.0.1:9615/assets/html/cross_origin_multiple_integrity_crossorigin.html',
                attributes: {
                    integrity: "sha384-OTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT sha512-1S9gT5BudArCBTfD251WLGI41DBGSO0NehUWEqvYdCwOEcr/FoGPvfVPOV5QxGhP8c3WstvgMFEwgPZgQUGyXg==",
                    crossorigin: "anonymous",
                    src: 'http://127.0.0.1:9616/assets/js/some_script.js'
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9616/assets/js/some_script.js",
                        "method": "GET",
                        "type": "Script",
                        "status": 200,
                        "size": 316,
                        "remoteIPAddress": "127.0.0.1",
                        "failureReason": undefined,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "b5ce71442f5678d8e54851c832579318c2d139b1582aa7b5bdd6c482f1e26121",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/cross_origin_multiple_integrity_crossorigin.html"
                        ]
                    }
                ],
                logs: []
            },
            {
                target: 'http://127.0.0.1:9615/assets/html/cross_origin_multiple_integrity_crossorigin.html',
                element: "LINK",
                document: 'http://127.0.0.1:9615/assets/html/cross_origin_multiple_integrity_crossorigin.html',
                attributes: {
                    integrity: "sha384-Iw54E1Wcqvl8hgVdh49U+WwaGqHp5YstLOVgpoFxv7pT4Lm36Cce7hQ4ZfeXY9wN sha512-OG1/cGZoV5UCmfbuafASsYOiGvlncSsgzia/B4ZDcqPNpyvMOVxIoN5EkR5oFitSdCKf+DPgBW3FnDsh+0y9wg==",
                    crossorigin: "anonymous",
                    rel: "stylesheet",
                    href: "http://127.0.0.1:9616/assets/css/some_css.css"
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9616/assets/css/some_css.css",
                        "method": "GET",
                        "type": "Stylesheet",
                        "status": 200,
                        "size": 316,
                        "remoteIPAddress": "127.0.0.1",
                        "failureReason": undefined,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "5ce2d1b9aca15041314794941fd346ea2e6d361060174de6102691a7341e80f2",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/cross_origin_multiple_integrity_crossorigin.html"
                        ]
                    }
                ],
                logs: []
            }
        ]

        // Act
        var result = await scrape(origin+'/assets/html/cross_origin_multiple_integrity_crossorigin.html')
        result = stripFluidFields(result)

        // Assert
        assert.deepStrictEqual(result, expectedResult)


    }).timeout(60000),

    it('tests valid cross origin request with multiple integrity of which one is wrong and valid crossorigin', async function() {
        // Arrange
        const expectedResult = [
            {
                target: 'http://127.0.0.1:9615/assets/html/cross_origin_multiple_integrity_one_wrong_crossorigin.html',
                element: 'SCRIPT',
                document: 'http://127.0.0.1:9615/assets/html/cross_origin_multiple_integrity_one_wrong_crossorigin.html',
                attributes: {
                    integrity: "sha384-xTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT sha512-1S9gT5BudArCBTfD251WLGI41DBGSO0NehUWEqvYdCwOEcr/FoGPvfVPOV5QxGhP8c3WstvgMFEwgPZgQUGyXg==",
                    crossorigin: "anonymous",
                    src: 'http://127.0.0.1:9616/assets/js/some_script.js'
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9616/assets/js/some_script.js",
                        "method": "GET",
                        "type": "Script",
                        "status": 200,
                        "size": 316,
                        "remoteIPAddress": "127.0.0.1",
                        "failureReason": undefined,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "b5ce71442f5678d8e54851c832579318c2d139b1582aa7b5bdd6c482f1e26121",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/cross_origin_multiple_integrity_one_wrong_crossorigin.html"
                        ]
                    }
                ],
                logs: []
            },
            {
                target: 'http://127.0.0.1:9615/assets/html/cross_origin_multiple_integrity_one_wrong_crossorigin.html',
                element: "LINK",
                document: 'http://127.0.0.1:9615/assets/html/cross_origin_multiple_integrity_one_wrong_crossorigin.html',
                attributes: {
                    integrity: "sha384-xw54E1Wcqvl8hgVdh49U+WwaGqHp5YstLOVgpoFxv7pT4Lm36Cce7hQ4ZfeXY9wN sha512-OG1/cGZoV5UCmfbuafASsYOiGvlncSsgzia/B4ZDcqPNpyvMOVxIoN5EkR5oFitSdCKf+DPgBW3FnDsh+0y9wg==",
                    crossorigin: "anonymous",
                    rel: "stylesheet",
                    href: "http://127.0.0.1:9616/assets/css/some_css.css"
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9616/assets/css/some_css.css",
                        "method": "GET",
                        "type": "Stylesheet",
                        "status": 200,
                        "size": 316,
                        "remoteIPAddress": "127.0.0.1",
                        "failureReason": undefined,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "5ce2d1b9aca15041314794941fd346ea2e6d361060174de6102691a7341e80f2",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/cross_origin_multiple_integrity_one_wrong_crossorigin.html"
                        ]
                    }
                ],
                logs: []
            }
        ]

        // Act
        var result = await scrape(origin+'/assets/html/cross_origin_multiple_integrity_one_wrong_crossorigin.html')
        result = stripFluidFields(result)

        // Assert
        assert.deepStrictEqual(result, expectedResult)


    }).timeout(60000),

    it('tests valid cross origin in iframe on external server with valid integrity and valid crossorigin', async function() {
        // Arrange
        const expectedResult = [
            {
                target: 'http://127.0.0.1:9615/assets/html/iframe_cross_origin_integrity.html',
                element: 'SCRIPT',
                document: 'http://127.0.0.1:9616/assets/html/iframe_cross_origin_integrity_destination.html',
                attributes: {
                    integrity: "sha384-OTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT",
                    crossorigin: "anonymous",
                    src: 'http://127.0.0.1:9617/assets/js/some_script.js'
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9617/assets/js/some_script.js",
                        "method": "GET",
                        "type": "Script",
                        "status": 200,
                        "size": 316,
                        "remoteIPAddress": "127.0.0.1",
                        "failureReason": undefined,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "b5ce71442f5678d8e54851c832579318c2d139b1582aa7b5bdd6c482f1e26121",
                        "initiators": [
                            "http://127.0.0.1:9616/assets/html/iframe_cross_origin_integrity_destination.html"
                        ]
                    }
                ],
                logs: []
            },
            {
                target: 'http://127.0.0.1:9615/assets/html/iframe_cross_origin_integrity.html',
                element: "LINK",
                document: 'http://127.0.0.1:9616/assets/html/iframe_cross_origin_integrity_destination.html',
                attributes: {
                    integrity: "sha384-Iw54E1Wcqvl8hgVdh49U+WwaGqHp5YstLOVgpoFxv7pT4Lm36Cce7hQ4ZfeXY9wN",
                    crossorigin: "anonymous",
                    rel: "stylesheet",
                    href: "http://127.0.0.1:9617/assets/css/some_css.css"
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9617/assets/css/some_css.css",
                        "method": "GET",
                        "type": "Stylesheet",
                        "status": 200,
                        "size": 316,
                        "remoteIPAddress": "127.0.0.1",
                        "failureReason": undefined,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "5ce2d1b9aca15041314794941fd346ea2e6d361060174de6102691a7341e80f2",
                        "initiators": [
                            "http://127.0.0.1:9616/assets/html/iframe_cross_origin_integrity_destination.html"
                        ]
                    }
                ],
                logs: []
            }
        ]

        // Act
        var result = await scrape(origin+'/assets/html/iframe_cross_origin_integrity.html')
        result = stripFluidFields(result)

        // Assert
        assert.deepStrictEqual(result, expectedResult)


    }).timeout(60000),

    it('tests valid cross origin in iframe on external server with invalid integrity and valid crossorigin', async function() {
        // Arrange
        const expectedResult = [
            {
                target: 'http://127.0.0.1:9615/assets/html/iframe_cross_origin_invalid_integrity_crossorigin.html',
                element: 'SCRIPT',
                document: 'http://127.0.0.1:9616/assets/html/iframe_cross_origin_invalid_integrity_crossorigin_destination.html',
                attributes: {
                    integrity: "sha384-xTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT",
                    crossorigin: "anonymous",
                    src: '/assets/js/some_script.js'
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9616/assets/js/some_script.js",
                        "method": "GET",
                        "type": "Script",
                        "status": 200,
                        "size": 316,
                        "remoteIPAddress": "127.0.0.1",
                        "failureReason": undefined,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "b5ce71442f5678d8e54851c832579318c2d139b1582aa7b5bdd6c482f1e26121",
                        "initiators": [
                            "http://127.0.0.1:9616/assets/html/iframe_cross_origin_invalid_integrity_crossorigin_destination.html"
                        ]
                    }
                ],
                logs: [
                    {
                        "source": "security",
                        "level": "error",
                        "text": "Failed to find a valid digest in the 'integrity' attribute for resource 'http://127.0.0.1:9616/assets/js/some_script.js' with computed SHA-384 integrity 'OTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT'. The resource has been blocked.",
                        "url": "http://127.0.0.1:9616/assets/html/iframe_cross_origin_invalid_integrity_crossorigin_destination.html"
                    }
                ]
            },
            {
                target: 'http://127.0.0.1:9615/assets/html/iframe_cross_origin_invalid_integrity_crossorigin.html',
                element: "LINK",
                document: 'http://127.0.0.1:9616/assets/html/iframe_cross_origin_invalid_integrity_crossorigin_destination.html',
                attributes: {
                    integrity: "sha384-xw54E1Wcqvl8hgVdh49U+WwaGqHp5YstLOVgpoFxv7pT4Lm36Cce7hQ4ZfeXY9wN",
                    crossorigin: "anonymous",
                    rel: "stylesheet",
                    href: "http://127.0.0.1:9617/assets/css/some_css.css"
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9617/assets/css/some_css.css",
                        "method": "GET",
                        "type": "Stylesheet",
                        "status": 200,
                        "size": 316,
                        "remoteIPAddress": "127.0.0.1",
                        "failureReason": undefined,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "5ce2d1b9aca15041314794941fd346ea2e6d361060174de6102691a7341e80f2",
                        "initiators": [
                            "http://127.0.0.1:9616/assets/html/iframe_cross_origin_invalid_integrity_crossorigin_destination.html"
                        ]
                    }
                ],
                logs: [
                    {
                        "source": "security",
                        "level": "error",
                        "text": "Failed to find a valid digest in the 'integrity' attribute for resource 'http://127.0.0.1:9617/assets/css/some_css.css' with computed SHA-384 integrity 'Iw54E1Wcqvl8hgVdh49U+WwaGqHp5YstLOVgpoFxv7pT4Lm36Cce7hQ4ZfeXY9wN'. The resource has been blocked.",
                        "url": "http://127.0.0.1:9616/assets/html/iframe_cross_origin_invalid_integrity_crossorigin_destination.html"
                    }
                ]
            }
        ]

        // Act
        var result = await scrape(origin+'/assets/html/iframe_cross_origin_invalid_integrity_crossorigin.html')
        result = stripFluidFields(result)

        // Assert
        assert.deepStrictEqual(result, expectedResult)


    }).timeout(60000),

    it('tests valid same origin request', async function() {
        // Arrange
        const expectedResult = [
            {
                target: 'http://127.0.0.1:9615/assets/html/same_origin.html',
                element: 'SCRIPT',
                document: 'http://127.0.0.1:9615/assets/html/same_origin.html',
                attributes: {
                    src: 'http://127.0.0.1:9615/assets/js/some_script.js'
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9615/assets/js/some_script.js",
                        "method": "GET",
                        "type": "Script",
                        "status": 200,
                        "size": 316,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "failureReason": undefined,
                        "remoteIPAddress": "127.0.0.1",
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "b5ce71442f5678d8e54851c832579318c2d139b1582aa7b5bdd6c482f1e26121",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/same_origin.html"
                        ]
                    }
                ],
                logs: []
            },
            {
                target: 'http://127.0.0.1:9615/assets/html/same_origin.html',
                element: 'LINK',
                document: 'http://127.0.0.1:9615/assets/html/same_origin.html',
                attributes: {
                    rel: 'stylesheet',
                    href: 'http://127.0.0.1:9615/assets/css/some_css.css'
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9615/assets/css/some_css.css",
                        "method": "GET",
                        "type": "Stylesheet",
                        "status": 200,
                        "size": 316,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "failureReason": undefined,
                        "remoteIPAddress": "127.0.0.1",
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "5ce2d1b9aca15041314794941fd346ea2e6d361060174de6102691a7341e80f2",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/same_origin.html"
                        ]
                    }
                ],
                logs: []
            }
        ]

        // Act
        var result = await scrape(origin+'/assets/html/same_origin.html')
        result = stripFluidFields(result)

        // Assert
        assert.deepEqual(result, expectedResult)
    }).timeout(60000),

    it('tests valid same origin request with valid integrity', async function() {
        // Arrange
        const expectedResult = [
            {
                target: 'http://127.0.0.1:9615/assets/html/same_origin_integrity.html',
                element: 'SCRIPT',
                document: 'http://127.0.0.1:9615/assets/html/same_origin_integrity.html',
                attributes: {
                    integrity: 'sha384-OTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT',
                    src: 'http://127.0.0.1:9615/assets/js/some_script.js'
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9615/assets/js/some_script.js",
                        "method": "GET",
                        "type": "Script",
                        "status": 200,
                        "size": 316,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "failureReason": undefined,
                        "remoteIPAddress": "127.0.0.1",
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "b5ce71442f5678d8e54851c832579318c2d139b1582aa7b5bdd6c482f1e26121",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/same_origin_integrity.html"
                        ]
                    }
                ],
                logs: []
            },
            {
                target: 'http://127.0.0.1:9615/assets/html/same_origin_integrity.html',
                element: 'LINK',
                document: 'http://127.0.0.1:9615/assets/html/same_origin_integrity.html',
                attributes: {
                    integrity: 'sha384-Iw54E1Wcqvl8hgVdh49U+WwaGqHp5YstLOVgpoFxv7pT4Lm36Cce7hQ4ZfeXY9wN',
                    rel: 'stylesheet',
                    href: 'http://127.0.0.1:9615/assets/css/some_css.css'
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9615/assets/css/some_css.css",
                        "method": "GET",
                        "type": "Stylesheet",
                        "status": 200,
                        "size": 316,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "failureReason": undefined,
                        "remoteIPAddress": "127.0.0.1",
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "5ce2d1b9aca15041314794941fd346ea2e6d361060174de6102691a7341e80f2",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/same_origin_integrity.html"
                        ]
                    }
                ],
                logs: []
            }
        ]

        // Act
        var result = await scrape(origin+'/assets/html/same_origin_integrity.html')
        result = stripFluidFields(result)

        // Assert
        assert.deepEqual(result, expectedResult)
    }).timeout(60000),

    it('tests valid same origin request with invalid integrity and valid crossorigin', async function() {
        // Arrange
        const expectedResult = [
            {
                target: 'http://127.0.0.1:9615/assets/html/same_origin_invalid_integrity_crossorigin.html',
                element: 'SCRIPT',
                document: 'http://127.0.0.1:9615/assets/html/same_origin_invalid_integrity_crossorigin.html',
                attributes: {
                    crossorigin: 'anonymous',
                    integrity: 'sha384-xTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT',
                    src: '/assets/js/some_script.js'
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9615/assets/js/some_script.js",
                        "method": "GET",
                        "type": "Script",
                        "status": 200,
                        "size": 316,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "failureReason": undefined,
                        "remoteIPAddress": "127.0.0.1",
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "b5ce71442f5678d8e54851c832579318c2d139b1582aa7b5bdd6c482f1e26121",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/same_origin_invalid_integrity_crossorigin.html"
                        ]
                    }
                ],
                logs: [
                    {
                        "source": "security",
                        "level": "error",
                        "text": "Failed to find a valid digest in the 'integrity' attribute for resource 'http://127.0.0.1:9615/assets/js/some_script.js' with computed SHA-384 integrity 'OTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT'. The resource has been blocked.",
                        "url": "http://127.0.0.1:9615/assets/html/same_origin_invalid_integrity_crossorigin.html"
                    }
                ]
            },
            {
                target: 'http://127.0.0.1:9615/assets/html/same_origin_invalid_integrity_crossorigin.html',
                element: 'LINK',
                document: 'http://127.0.0.1:9615/assets/html/same_origin_invalid_integrity_crossorigin.html',
                attributes: {
                    crossorigin: 'anonymous',
                    integrity: 'sha384-xw54E1Wcqvl8hgVdh49U+WwaGqHp5YstLOVgpoFxv7pT4Lm36Cce7hQ4ZfeXY9wN',
                    rel: 'stylesheet',
                    href: 'http://127.0.0.1:9615/assets/css/some_css.css'
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9615/assets/css/some_css.css",
                        "method": "GET",
                        "type": "Stylesheet",
                        "status": 200,
                        "size": 316,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "failureReason": undefined,
                        "remoteIPAddress": "127.0.0.1",
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "5ce2d1b9aca15041314794941fd346ea2e6d361060174de6102691a7341e80f2",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/same_origin_invalid_integrity_crossorigin.html"
                        ]
                    }
                ],
                logs: [
                    {
                        "source": "security",
                        "level": "error",
                        "text": "Failed to find a valid digest in the 'integrity' attribute for resource 'http://127.0.0.1:9615/assets/css/some_css.css' with computed SHA-384 integrity 'Iw54E1Wcqvl8hgVdh49U+WwaGqHp5YstLOVgpoFxv7pT4Lm36Cce7hQ4ZfeXY9wN'. The resource has been blocked.",
                        "url": "http://127.0.0.1:9615/assets/html/same_origin_invalid_integrity_crossorigin.html"
                    }
                ]
            }
        ]

        // Act
        var result = await scrape(origin+'/assets/html/same_origin_invalid_integrity_crossorigin.html')
        result = stripFluidFields(result)

        // Assert
        assert.deepEqual(result, expectedResult)
    }).timeout(60000),

    it('tests valid same origin request with valid integrity and crossorigin', async function() {
        // Arrange
        const expectedResult = [
            {
                target: 'http://127.0.0.1:9615/assets/html/same_origin_integrity_crossorigin.html',
                element: 'SCRIPT',
                document: 'http://127.0.0.1:9615/assets/html/same_origin_integrity_crossorigin.html',
                attributes: {
                    crossorigin: 'anonymous',
                    integrity: 'sha384-OTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT',
                    src: 'http://127.0.0.1:9615/assets/js/some_script.js'
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9615/assets/js/some_script.js",
                        "method": "GET",
                        "type": "Script",
                        "status": 200,
                        "size": 316,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "failureReason": undefined,
                        "remoteIPAddress": "127.0.0.1",
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "b5ce71442f5678d8e54851c832579318c2d139b1582aa7b5bdd6c482f1e26121",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/same_origin_integrity_crossorigin.html"
                        ]
                    }
                ],
                logs: []
            },
            {
                target: 'http://127.0.0.1:9615/assets/html/same_origin_integrity_crossorigin.html',
                element: 'LINK',
                document: 'http://127.0.0.1:9615/assets/html/same_origin_integrity_crossorigin.html',
                attributes: {
                    crossorigin: 'anonymous',
                    integrity: 'sha384-Iw54E1Wcqvl8hgVdh49U+WwaGqHp5YstLOVgpoFxv7pT4Lm36Cce7hQ4ZfeXY9wN',
                    rel: 'stylesheet',
                    href: 'http://127.0.0.1:9615/assets/css/some_css.css'
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9615/assets/css/some_css.css",
                        "method": "GET",
                        "type": "Stylesheet",
                        "status": 200,
                        "size": 316,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "failureReason": undefined,
                        "remoteIPAddress": "127.0.0.1",
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "5ce2d1b9aca15041314794941fd346ea2e6d361060174de6102691a7341e80f2",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/same_origin_integrity_crossorigin.html"
                        ]
                    }
                ],
                logs: []
            }
        ]

        // Act
        var result = await scrape(origin+'/assets/html/same_origin_integrity_crossorigin.html')
        result = stripFluidFields(result)

        // Assert
        assert.deepEqual(result, expectedResult)
    }).timeout(60000)

    it('tests dynamic script insert with invalid integrity and crossorigin', async function() {
        // Arrange
        const expectedResult = [
            {
                target: 'http://127.0.0.1:9615/assets/html/dynamic_script_insert_cross_origin_invalid_integrity_crossorigin.html',
                element: 'SCRIPT',
                document: 'http://127.0.0.1:9615/assets/html/dynamic_script_insert_cross_origin_invalid_integrity_crossorigin.html',
                attributes: {
                    src: 'http://127.0.0.1:9616/assets/js/some_script.js',
                    crossorigin: 'anonymous',
                    integrity: 'sha384-xTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT'
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9616/assets/js/some_script.js",
                        "method": "GET",
                        "type": "Script",
                        "status": 200,
                        "size": 316,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "failureReason": undefined,
                        "remoteIPAddress": "127.0.0.1",
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "b5ce71442f5678d8e54851c832579318c2d139b1582aa7b5bdd6c482f1e26121",
                        "initiators": [
                            "http://127.0.0.1:9615/assets/html/dynamic_script_insert_cross_origin_invalid_integrity_crossorigin.html"
                        ]
                    }
                ],
                logs: [
                    {
                        "source": "security",
                        "level": "error",
                        "text": "Failed to find a valid digest in the 'integrity' attribute for resource 'http://127.0.0.1:9616/assets/js/some_script.js' with computed SHA-384 integrity 'OTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT'. The resource has been blocked.",
                        "url": "http://127.0.0.1:9615/assets/html/dynamic_script_insert_cross_origin_invalid_integrity_crossorigin.html"
                    }
                ]
            },
            {
                target: 'http://127.0.0.1:9615/assets/html/dynamic_script_insert_cross_origin_invalid_integrity_crossorigin.html',
                element: 'SCRIPT',
                document: 'http://127.0.0.1:9615/assets/html/dynamic_script_insert_cross_origin_invalid_integrity_crossorigin.html',
                attributes: {},
                requests: [],
                logs: []
            }
        ]

        // Act
        var result = await scrape(origin+'/assets/html/dynamic_script_insert_cross_origin_invalid_integrity_crossorigin.html')
        result = stripFluidFields(result)

        // Assert
        assert.deepEqual(result, expectedResult)
    }).timeout(60000),

    it('tests dynamic script insert in iframe with invalid integrity and crossorigin', async function() {
        // Arrange
        const expectedResult = [
            {
                target: 'http://127.0.0.1:9615/assets/html/dynamic_script_insert_iframe_cross_origin_invalid_integrity_crossorigin.html',
                element: 'SCRIPT',
                document: 'http://127.0.0.1:9616/assets/html/dynamic_script_insert_iframe_cross_origin_invalid_integrity_crossorigin_destination.html',
                attributes: {
                    src: 'http://127.0.0.1:9617/assets/js/some_script.js',
                    crossorigin: 'anonymous',
                    integrity: 'sha384-xTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT'
                },
                requests: [
                    {
                        "url": "http://127.0.0.1:9617/assets/js/some_script.js",
                        "method": "GET",
                        "type": "Script",
                        "status": 200,
                        "size": 316,
                        "redirectedFrom": undefined,
                        "redirectedTo": undefined,
                        "failureReason": undefined,
                        "remoteIPAddress": "127.0.0.1",
                        "responseHeaders": {
                            "access-control-allow-origin": "*"
                        },
                        "responseBodyHash": "b5ce71442f5678d8e54851c832579318c2d139b1582aa7b5bdd6c482f1e26121",
                        "initiators": [
                            "http://127.0.0.1:9616/assets/html/dynamic_script_insert_iframe_cross_origin_invalid_integrity_crossorigin_destination.html"
                        ]
                    }
                ],
                logs: [
                    {
                        "source": "security",
                        "level": "error",
                        "text": "Failed to find a valid digest in the 'integrity' attribute for resource 'http://127.0.0.1:9617/assets/js/some_script.js' with computed SHA-384 integrity 'OTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT'. The resource has been blocked.",
                        "url": "http://127.0.0.1:9616/assets/html/dynamic_script_insert_iframe_cross_origin_invalid_integrity_crossorigin_destination.html"
                    }
                ]
            },
            {
                target: 'http://127.0.0.1:9615/assets/html/dynamic_script_insert_iframe_cross_origin_invalid_integrity_crossorigin.html',
                element: 'SCRIPT',
                document: 'http://127.0.0.1:9616/assets/html/dynamic_script_insert_iframe_cross_origin_invalid_integrity_crossorigin_destination.html',
                attributes: {},
                requests: [],
                logs: []
            }
        ]

        // Act
        var result = await scrape(origin+'/assets/html/dynamic_script_insert_iframe_cross_origin_invalid_integrity_crossorigin.html')
        result = stripFluidFields(result)

        // Assert
        assert.deepEqual(result, expectedResult)
    }).timeout(60000)
})
