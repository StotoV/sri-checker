const assert = require('assert');

const index = require('../src/index.js')
const label = require('../src/label.js')

function onlyKeepRelevantFields(input, fields) {
    input.forEach((e) => Object.keys(e).forEach((k) => fields.includes(k) || delete e[k]))
}

describe('Labeler tests', function() {
    it('tests labeler sets proper connection protocol for origin', function() {
        // Arrange
        const input = [
            {
                target: 'https://example.com',
                attributes: {},
                logs: []
            },
            {
                target: 'http://example.com',
                attributes: {},
                logs: []
            }
        ]
        const expectedResult = [
            {
                target: 'https://example.com',
                pageUsesHttps: true
            },
            {
                target: 'http://example.com',
                pageUsesHttps: false
            },
        ]

        // Act
        let result = label(input)
        onlyKeepRelevantFields(result, ['target', 'pageUsesHttps'])

        // Assert
        assert.deepEqual(result, expectedResult)
    }),

    it('tests labeler sets proper resource from tag', function() {
        // Arrange
        const input = [
            {
                target: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: 'https://example.com/some_script.js'
                },
                logs: []
            },
            {
                target: 'https://example.com',
                element: 'SCRIPT',
                attributes: {},
                logs: []
            },
            {
                target: 'https://example.com',
                element: 'LINK',
                attributes: {
                    href: 'https://example.com/some_css.css'
                },
                logs: []
            }
        ]
        const expectedResult = [
            {
                target: 'https://example.com',
                resource: 'https://example.com/some_script.js'
            },
            {
                target: 'https://example.com',
                resource: undefined
            },
            {
                target: 'https://example.com',
                resource: 'https://example.com/some_css.css'
            }
        ]

        // Act
        let result = label(input)
        onlyKeepRelevantFields(result, ['target', 'resource'])

        // Assert
        assert.deepEqual(result, expectedResult)
    }),

    it('tests labeler augments relative resource with target', function() {
        // Arrange
        const input = [
            {
                target: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: '/some_script.js'
                },
                logs: []
            },
            {
                target: 'https://example.com',
                element: 'SCRIPT',
                attributes: {},
                logs: []
            }
        ]
        const expectedResult = [
            {
                resource: 'https://example.com/some_script.js'
            },
            {
                resource: undefined
            }
        ]

        // Act
        let result = label(input)
        onlyKeepRelevantFields(result, ['resource'])

        // Assert
        assert.deepEqual(result, expectedResult)
    }),

    it('tests labeler sets proper connection protocol for resource', function() {
        // Arrange
        const input = [
            {
                target: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: 'https://example.com/some_script.js'
                },
                logs: []
            },
            {
                target: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: 'http://example.com/some_script.js'
                },
                logs: []
            },
            {
                target: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: '//example.com/some_script.js'
                },
                logs: []
            },
            {
                target: 'https://example.com',
                element: 'SCRIPT',
                attributes: {},
                logs: []
            },
        ]
        const expectedResult = [
            {
                resourceUsesHttps: true
            },
            {
                resourceUsesHttps: false
            },
            {
                resourceUsesHttps: true
            },
            {
                resourceUsesHttps: false
            },
        ]

        // Act
        let result = label(input)
        onlyKeepRelevantFields(result, ['resourceUsesHttps'])

        // Assert
        assert.deepEqual(result, expectedResult)
    }),

    it('tests labeler sets proper resource is cross origin', function() {
        // Arrange
        const input = [
            {
                target: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: 'https://example2.com/some_script.js'
                },
                logs: []
            },
            {
                target: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: 'http://example.com/some_script.js'
                },
                logs: []
            },
            {
                target: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: '//example2.com/some_script.js'
                },
                logs: []
            },
            {
                target: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: '//example2.com/some_script.js'
                },
                logs: []
            },
            {
                target: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: 'https://example.com:8080/some_script.js'
                },
                logs: []
            },
            {
                target: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: 'https://cdn.example.com/some_script.js'
                },
                logs: []
            },
        ]
        let expectedResult = Array(6)
        expectedResult.fill(
            {
                resourceCrossOrigin: true
            }
        )

        // Act
        const result = label(input)
        onlyKeepRelevantFields(result, ['resourceCrossOrigin'])

        // Assert
        assert.deepEqual(result, expectedResult)
    }),

    it('tests labeler sets proper hasIntegrity', function() {
        // Arrange
        const input = [
            {
                target: 'https://example.com',
                attributes: {
                    integrity: ''
                },
                logs: []
            },
            {
                target: 'https://example.com',
                attributes: {
                    integrity: 'sha384-OTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT'
                },
                logs: []
            },
            {
                target: 'https://example.com',
                attributes: {
                    integrity: 'sha384-xTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT'
                },
                logs: []
            },
            {
                target: 'https://example.com',
                attributes: {},
                logs: []
            }
        ]
        let expectedResult = [
            {
                hasIntegrity: true
            },
            {
                hasIntegrity: true
            },
            {
                hasIntegrity: true
            },
            {
                hasIntegrity: false
            }
        ]

        // Act
        const result = label(input)
        onlyKeepRelevantFields(result, ['hasIntegrity'])

        // Assert
        assert.deepEqual(result, expectedResult)
    }),

    it('tests labeler sets proper hasCrossorigin', function() {
        // Arrange
        const input = [
            {
                target: 'https://example.com',
                attributes: {
                    crossorigin: ''
                },
                logs: []
            },
            {
                target: 'https://example.com',
                attributes: {
                    crossorigin: 'anonymous'
                },
                logs: []
            },
            {
                target: 'https://example.com',
                attributes: {
                    crossorigin: 'use-credentials'
                },
                logs: []
            },
            {
                target: 'https://example.com',
                attributes: {
                    crossorigin: 'malformed'
                },
                logs: []
            },
            {
                target: 'https://example.com',
                attributes: {},
                logs: []
            }
        ]
        let expectedResult = [
            {
                hasCrossorigin: true
            },
            {
                hasCrossorigin: true
            },
            {
                hasCrossorigin: true
            },
            {
                hasCrossorigin: true
            },
            {
                hasCrossorigin: false
            }
        ]

        // Act
        const result = label(input)
        onlyKeepRelevantFields(result, ['hasCrossorigin'])

        // Assert
        assert.deepEqual(result, expectedResult)
    }),

    it('tests labeler handles log message correctly', function() {
        // Arrange
        const input = [
            {
                target: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: 'https://example2.com/assets/js/some_script.js',
                    integrity: ''
                },
                logs: [
                    {
                        text: "Subresource Integrity: The resource 'https://example2.com/assets/js/some_script.js' has an integrity attribute, but the resource requires the request to be CORS enabled to check the integrity, and it is not. The resource has been blocked because the integrity cannot be enforced."
                    }
                ]
            },
            {
                target: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: 'https://example2.com/assets/js/some_script.js',
                    integrity: ''
                },
                logs: [
                    {
                        text: "Access to script at 'https://example2.com/assets/js/some_script.js' from origin 'https://example.com' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'."
                    }
                ]
            },
            {
                target: 'https://example.com',
                element: 'LINK',
                attributes: {
                    href: 'https://example2.com/assets/css/some_css.css',
                    integrity: ''
                },
                logs: [
                    {
                        text: "Access to CSS stylesheet at 'https://example2.com/assets/css/some_css.css' from origin 'https://example.com' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'."
                    }
                ]
            },
            {
                target: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: 'https://example2.com/assets/js/some_script.js',
                    integrity: 'sha256-invalidhash',
                    crossorigin: 'anonymous'
                },
                logs: [
                    {
                        text: "Failed to find a valid digest in the 'integrity' attribute for resource 'https://example2.com/assets/js/some_script.js' with computed SHA-256 integrity 'sha256-invalidhash'. The resource has been blocked."
                    }
                ]
            },
            {
                target: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: 'https://example2.com/assets/js/some_script.js',
                    integrity: 'md5-invalidhash',
                    crossorigin: 'anonymous'
                },
                logs: [
                    {
                        text: "Error parsing 'integrity' attribute ('md5-invalidhash'). The specified hash algorithm must be one of 'sha256', 'sha384', or 'sha512'."
                    }
                ]
            },
            {
                target: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: 'https://example2.com/assets/js/some_script.js',
                    integrity: 'invalidintegrity',
                    crossorigin: 'anonymous'
                },
                logs: [
                    {
                        text: "Error parsing 'integrity' attribute ('invalidintegrity'). The hash algorithm must be one of 'sha256', 'sha384', or 'sha512', followed by a '-' character."
                    }
                ]
            },
            {
                target: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: 'https://example2.com/assets/js/some_script.js',
                    integrity: '',
                    crossorigin: 'anonymous'
                },
                logs: []
            },
        ]
        let expectedResult = [
            {
                hasValidIntegrity: undefined,
                usesUnsupportedHash: false,
                hasMalformedIntegrity: undefined,
                hasValidCrossorigin: false
            },
            {
                hasValidIntegrity: undefined,
                usesUnsupportedHash: false,
                hasMalformedIntegrity: undefined,
                hasValidCrossorigin: false
            },
            {
                hasValidIntegrity: undefined,
                usesUnsupportedHash: false,
                hasMalformedIntegrity: undefined,
                hasValidCrossorigin: false
            },
            {
                hasValidIntegrity: false,
                usesUnsupportedHash: false,
                hasMalformedIntegrity: false,
                hasValidCrossorigin: true
            },
            {
                hasValidIntegrity: false,
                usesUnsupportedHash: true,
                hasMalformedIntegrity: false,
                hasValidCrossorigin: true
            },
            {
                hasValidIntegrity: false,
                usesUnsupportedHash: false,
                hasMalformedIntegrity: true,
                hasValidCrossorigin: true
            },
            {
                hasValidIntegrity: true,
                usesUnsupportedHash: false,
                hasMalformedIntegrity: false,
                hasValidCrossorigin: true
            }
        ]

        // Act
        const result = label(input)
        onlyKeepRelevantFields(result, ['hasValidIntegrity', 'usesUnsupportedHash', 'hasMalformedIntegrity', 'hasValidCrossorigin'])

        // Assert
        assert.deepEqual(result, expectedResult)
    })
})
