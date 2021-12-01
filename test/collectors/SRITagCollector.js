const assert = require('assert');

const SRITagCollector = require('../../src/collectors/SRITagCollector.js')

function getFakeCDPClient(tree, attrs) {
    return {
        /**
         * @param {string} command
         */
        send(command, params) {
            if (command === 'Page.enable' || command === 'DOM.enable') {
                return Promise.resolve()
            }
            if (command === 'DOM.getDocument') {
                return Promise.resolve(tree)
            } else if (command === 'DOM.getAttributes') {
                return Promise.resolve(attrs[params.nodeId])
            }

            throw new Error('Unexpected command called: ' + command)
        }
    }
}

describe('Scraper tests', async function() {
    var collector
    before(function() {
        collector = new SRITagCollector()
        const log = (msg) => {console.log(msg)}
        collector.init({log})
    }),

    it('tests the correct extraction of SRI elements', async function() {
        // Arrange
        const tree = {
            "root": {
                "nodeId": 1,
                "backendNodeId": 2,
                "nodeType": 9,
                "nodeName": "#document",
                "localName": "",
                "nodeValue": "",
                "childNodeCount": 1,
                "children": [
                    {
                        "nodeId": 2,
                        "parentId": 1,
                        "backendNodeId": 5,
                        "nodeType": 1,
                        "nodeName": "HTML",
                        "localName": "html",
                        "nodeValue": "",
                        "childNodeCount": 2,
                        "children": [
                            {
                                "nodeId": 3,
                                "parentId": 2,
                                "backendNodeId": 6,
                                "nodeType": 1,
                                "nodeName": "HEAD",
                                "localName": "head",
                                "nodeValue": "",
                                "childNodeCount": 1,
                                "children": [
                                    {
                                        "nodeId": 4,
                                        "parentId": 3,
                                        "backendNodeId": 7,
                                        "nodeType": 1,
                                        "nodeName": "LINK",
                                        "localName": "link",
                                        "nodeValue": "",
                                        "childNodeCount": 0,
                                        "children": [],
                                        "attributes": [
                                            "rel",
                                            "stylesheet",
                                            "href",
                                            "http://127.0.0.1:9615/assets/css/some_css.css"
                                        ]
                                    }
                                ],
                                "attributes": []
                            },
                            {
                                "nodeId": 5,
                                "parentId": 2,
                                "backendNodeId": 8,
                                "nodeType": 1,
                                "nodeName": "BODY",
                                "localName": "body",
                                "nodeValue": "",
                                "childNodeCount": 2,
                                "children": [
                                    {
                                        "nodeId": 6,
                                        "parentId": 5,
                                        "backendNodeId": 9,
                                        "nodeType": 1,
                                        "nodeName": "IFRAME",
                                        "localName": "iframe",
                                        "nodeValue": "",
                                        "childNodeCount": 0,
                                        "children": [],
                                        "attributes": [
                                            "src",
                                            "http://127.0.0.1:9616/assets/html/tmp2.html"
                                        ],
                                        "frameId": "0FC0E5C149086E8DC25EB9A62681463B",
                                        "contentDocument": {
                                            "nodeId": 7,
                                            "backendNodeId": 3,
                                            "nodeType": 9,
                                            "nodeName": "#document",
                                            "localName": "",
                                            "nodeValue": "",
                                            "childNodeCount": 1,
                                            "children": [
                                                {
                                                    "nodeId": 8,
                                                    "parentId": 7,
                                                    "backendNodeId": 10,
                                                    "nodeType": 1,
                                                    "nodeName": "HTML",
                                                    "localName": "html",
                                                    "nodeValue": "",
                                                    "childNodeCount": 2,
                                                    "children": [
                                                        {
                                                            "nodeId": 9,
                                                            "parentId": 8,
                                                            "backendNodeId": 11,
                                                            "nodeType": 1,
                                                            "nodeName": "HEAD",
                                                            "localName": "head",
                                                            "nodeValue": "",
                                                            "childNodeCount": 1,
                                                            "children": [
                                                                {
                                                                    "nodeId": 10,
                                                                    "parentId": 9,
                                                                    "backendNodeId": 12,
                                                                    "nodeType": 1,
                                                                    "nodeName": "LINK",
                                                                    "localName": "link",
                                                                    "nodeValue": "",
                                                                    "childNodeCount": 0,
                                                                    "children": [],
                                                                    "attributes": [
                                                                        "rel",
                                                                        "stylesheet",
                                                                        "href",
                                                                        "../css/some_css.css"
                                                                    ]
                                                                }
                                                            ],
                                                            "attributes": []
                                                        },
                                                        {
                                                            "nodeId": 11,
                                                            "parentId": 8,
                                                            "backendNodeId": 13,
                                                            "nodeType": 1,
                                                            "nodeName": "BODY",
                                                            "localName": "body",
                                                            "nodeValue": "",
                                                            "childNodeCount": 2,
                                                            "children": [
                                                                {
                                                                    "nodeId": 12,
                                                                    "parentId": 11,
                                                                    "backendNodeId": 14,
                                                                    "nodeType": 1,
                                                                    "nodeName": "IFRAME",
                                                                    "localName": "iframe",
                                                                    "nodeValue": "",
                                                                    "childNodeCount": 0,
                                                                    "children": [],
                                                                    "attributes": [
                                                                        "src",
                                                                        "http://127.0.0.1:9617/assets/html/tmp3.html"
                                                                    ],
                                                                    "frameId": "4CC58C65EEEE38967E288486D70BC447",
                                                                    "contentDocument": {
                                                                        "nodeId": 13,
                                                                        "backendNodeId": 4,
                                                                        "nodeType": 9,
                                                                        "nodeName": "#document",
                                                                        "localName": "",
                                                                        "nodeValue": "",
                                                                        "childNodeCount": 1,
                                                                        "children": [
                                                                            {
                                                                                "nodeId": 14,
                                                                                "parentId": 13,
                                                                                "backendNodeId": 15,
                                                                                "nodeType": 1,
                                                                                "nodeName": "HTML",
                                                                                "localName": "html",
                                                                                "nodeValue": "",
                                                                                "childNodeCount": 2,
                                                                                "children": [
                                                                                    {
                                                                                        "nodeId": 15,
                                                                                        "parentId": 14,
                                                                                        "backendNodeId": 16,
                                                                                        "nodeType": 1,
                                                                                        "nodeName": "HEAD",
                                                                                        "localName": "head",
                                                                                        "nodeValue": "",
                                                                                        "childNodeCount": 1,
                                                                                        "children": [
                                                                                            {
                                                                                                "nodeId": 16,
                                                                                                "parentId": 15,
                                                                                                "backendNodeId": 17,
                                                                                                "nodeType": 1,
                                                                                                "nodeName": "LINK",
                                                                                                "localName": "link",
                                                                                                "nodeValue": "",
                                                                                                "childNodeCount": 0,
                                                                                                "children": [],
                                                                                                "attributes": [
                                                                                                    "integrity",
                                                                                                    "sha384-Iw54E1Wcqvl8hgVdh49U+WwaGqHp5YstLOVgpoFxv7pT4Lm36Cce7hQ4ZfeXY9wN",
                                                                                                    "crossorigin",
                                                                                                    "anonymous",
                                                                                                    "rel",
                                                                                                    "stylesheet",
                                                                                                    "href",
                                                                                                    "http://127.0.0.1:9615/assets/css/some_css.css"
                                                                                                ]
                                                                                            }
                                                                                        ],
                                                                                        "attributes": []
                                                                                    },
                                                                                    {
                                                                                        "nodeId": 17,
                                                                                        "parentId": 14,
                                                                                        "backendNodeId": 18,
                                                                                        "nodeType": 1,
                                                                                        "nodeName": "BODY",
                                                                                        "localName": "body",
                                                                                        "nodeValue": "",
                                                                                        "childNodeCount": 1,
                                                                                        "children": [
                                                                                            {
                                                                                                "nodeId": 18,
                                                                                                "parentId": 17,
                                                                                                "backendNodeId": 19,
                                                                                                "nodeType": 1,
                                                                                                "nodeName": "SCRIPT",
                                                                                                "localName": "script",
                                                                                                "nodeValue": "",
                                                                                                "childNodeCount": 0,
                                                                                                "children": [],
                                                                                                "attributes": [
                                                                                                    "integrity",
                                                                                                    "sha384-OTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT",
                                                                                                    "crossorigin",
                                                                                                    "anonymous",
                                                                                                    "src",
                                                                                                    "http://127.0.0.1:9615/assets/js/some_script.js"
                                                                                                ]
                                                                                            }
                                                                                        ],
                                                                                        "attributes": []
                                                                                    }
                                                                                ],
                                                                                "attributes": [],
                                                                                "frameId": "4CC58C65EEEE38967E288486D70BC447"
                                                                            }
                                                                        ],
                                                                        "documentURL": "http://127.0.0.1:9617/assets/html/tmp3.html",
                                                                        "baseURL": "http://127.0.0.1:9617/assets/html/tmp3.html",
                                                                        "xmlVersion": "",
                                                                        "compatibilityMode": "QuirksMode"
                                                                    }
                                                                },
                                                                {
                                                                    "nodeId": 19,
                                                                    "parentId": 11,
                                                                    "backendNodeId": 20,
                                                                    "nodeType": 1,
                                                                    "nodeName": "SCRIPT",
                                                                    "localName": "script",
                                                                    "nodeValue": "",
                                                                    "childNodeCount": 1,
                                                                    "children": [
                                                                        {
                                                                            "nodeId": 20,
                                                                            "parentId": 19,
                                                                            "backendNodeId": 21,
                                                                            "nodeType": 3,
                                                                            "nodeName": "#text",
                                                                            "localName": "",
                                                                            "nodeValue": "console.log('some javascript')"
                                                                        }
                                                                    ],
                                                                    "attributes": []
                                                                }
                                                            ],
                                                            "attributes": []
                                                        }
                                                    ],
                                                    "attributes": [],
                                                    "frameId": "0FC0E5C149086E8DC25EB9A62681463B"
                                                }
                                            ],
                                            "documentURL": "http://127.0.0.1:9616/assets/html/tmp2.html",
                                            "baseURL": "http://127.0.0.1:9616/assets/html/tmp2.html",
                                            "xmlVersion": "",
                                            "compatibilityMode": "QuirksMode"
                                        }
                                    },
                                    {
                                        "nodeId": 21,
                                        "parentId": 5,
                                        "backendNodeId": 22,
                                        "nodeType": 1,
                                        "nodeName": "SCRIPT",
                                        "localName": "script",
                                        "nodeValue": "",
                                        "childNodeCount": 0,
                                        "children": [],
                                        "attributes": [
                                            "src",
                                            "http://127.0.0.1:9615/assets/js/some_script.js"
                                        ]
                                    }
                                ],
                                "attributes": []
                            }
                        ],
                        "attributes": [],
                        "frameId": "568693479C103E002FF0FEBA7287074E"
                    }
                ],
                "documentURL": "http://127.0.0.1:9615/assets/html/tmp.html",
                "baseURL": "http://127.0.0.1:9615/assets/html/tmp.html",
                "xmlVersion": "",
                "compatibilityMode": "QuirksMode"
            }
        }
        const attrs = {
            "4": {
                "attributes": [
                    "rel",
                    "stylesheet",
                    "href",
                    "http://127.0.0.1:9615/assets/css/some_css.css"
                ]
            },
            "10": {
                "attributes": [
                    "rel",
                    "stylesheet",
                    "href",
                    "../css/some_css.css"
                ]
            },
            "16": {
                "attributes": [
                    "integrity",
                    "sha384-Iw54E1Wcqvl8hgVdh49U+WwaGqHp5YstLOVgpoFxv7pT4Lm36Cce7hQ4ZfeXY9wN",
                    "crossorigin",
                    "anonymous",
                    "rel",
                    "stylesheet",
                    "href",
                    "http://127.0.0.1:9615/assets/css/some_css.css"
                ]
            },
            "18": {
                "attributes": [
                    "integrity",
                    "sha384-OTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT",
                    "crossorigin",
                    "anonymous",
                    "src",
                    "http://127.0.0.1:9615/assets/js/some_script.js"
                ]
            },
            "19": {
                "attributes": []
            },
            "21": {
                "attributes": [
                    "src",
                    "http://127.0.0.1:9615/assets/js/some_script.js"
                ]
            }
        }
        const expectedResult = [
            {
                "element": "SCRIPT",
                "attributes": {
                    "src": "http://127.0.0.1:9615/assets/js/some_script.js",
                }
            },
            {
                "element": "SCRIPT",
                "attributes": {}
            },
            {
                "element": "SCRIPT",
                "attributes": {
                    "integrity": "sha384-OTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT",
                    "crossorigin": "anonymous",
                    "src": "http://127.0.0.1:9615/assets/js/some_script.js"
                }
            },
            {
                "element": "LINK",
                "attributes": {
                    "integrity": "sha384-Iw54E1Wcqvl8hgVdh49U+WwaGqHp5YstLOVgpoFxv7pT4Lm36Cce7hQ4ZfeXY9wN",
                    "crossorigin": "anonymous",
                    "rel": "stylesheet",
                    "href": "http://127.0.0.1:9615/assets/css/some_css.css"
                }
            },
            {
                "element": "LINK",
                "attributes": {
                    "rel": "stylesheet",
                    "href": "../css/some_css.css"
                }
            },
            {
                "element": "LINK",
                "attributes": {
                    "rel": "stylesheet",
                    "href": "http://127.0.0.1:9615/assets/css/some_css.css"
                }
            }
        ]
        const fakeCDPClient = getFakeCDPClient(tree, attrs)
        collector.addTarget({cdpClient: fakeCDPClient, type: 'page', url: 'http://example.com'});

        // Act
        const result = await collector.getData({})

        // Assert
        assert.deepEqual(expectedResult, result)
    })
})
