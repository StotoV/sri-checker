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
                origin: 'https://example.com',
                attributes: {}
            },
            {
                origin: 'http://example.com',
                attributes: {}
            }
        ]
        const expectedResult = [
            {
                origin: 'https://example.com',
                pageUsesHttps: true
            },
            {
                origin: 'http://example.com',
                pageUsesHttps: false
            },
        ]

        // Act
        let result = label(input)
        onlyKeepRelevantFields(result, ['origin', 'pageUsesHttps'])

        // Assert
        assert.deepEqual(result, expectedResult)
    }),

    it('tests labeler sets proper resource from tag', function() {
        // Arrange
        const input = [
            {
                origin: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: 'https://example.com/some_script.js'
                }
            },
            {
                origin: 'https://example.com',
                element: 'SCRIPT',
                attributes: {}
            },
            {
                origin: 'https://example.com',
                element: 'LINK',
                attributes: {
                    href: 'https://example.com/some_css.css'
                }
            }
        ]
        const expectedResult = [
            {
                origin: 'https://example.com',
                resource: 'https://example.com/some_script.js'
            },
            {
                origin: 'https://example.com',
                resource: undefined
            },
            {
                origin: 'https://example.com',
                resource: 'https://example.com/some_css.css'
            }
        ]

        // Act
        let result = label(input)
        onlyKeepRelevantFields(result, ['origin', 'resource'])

        // Assert
        assert.deepEqual(result, expectedResult)
    }),

    it('tests labeler augments relative resource with origin', function() {
        // Arrange
        const input = [
            {
                origin: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: '/some_script.js'
                }
            },
            {
                origin: 'https://example.com',
                element: 'SCRIPT',
                attributes: {}
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
                origin: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: 'https://example.com/some_script.js'
                }
            },
            {
                origin: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: 'http://example.com/some_script.js'
                }
            },
            {
                origin: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: '//example.com/some_script.js'
                }
            },
            {
                origin: 'https://example.com',
                element: 'SCRIPT',
                attributes: {}
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
                origin: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: 'https://example2.com/some_script.js'
                }
            },
            {
                origin: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: 'http://example.com/some_script.js'
                }
            },
            {
                origin: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: '//example2.com/some_script.js'
                }
            },
            {
                origin: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: '//example2.com/some_script.js'
                }
            },
            {
                origin: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: 'https://example.com:8080/some_script.js'
                }
            },
            {
                origin: 'https://example.com',
                element: 'SCRIPT',
                attributes: {
                    src: 'https://cdn.example.com/some_script.js'
                }
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
                origin: 'https://example.com',
                attributes: {
                    integrity: ''
                }
            },
            {
                origin: 'https://example.com',
                attributes: {
                    integrity: 'sha384-OTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT'
                }
            },
            {
                origin: 'https://example.com',
                attributes: {
                    integrity: 'sha384-xTB95wikPeum8g0co00sBi/YoX8Si1NHyQGdqrOYBGyoKpbqgUntzjW/ACajRLKT'
                }
            },
            {
                origin: 'https://example.com',
                attributes: {}
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
                origin: 'https://example.com',
                attributes: {
                    crossorigin: ''
                }
            },
            {
                origin: 'https://example.com',
                attributes: {
                    crossorigin: 'anonymous'
                }
            },
            {
                origin: 'https://example.com',
                attributes: {
                    crossorigin: 'use-credentials'
                }
            },
            {
                origin: 'https://example.com',
                attributes: {
                    crossorigin: 'malformed'
                }
            },
            {
                origin: 'https://example.com',
                attributes: {}
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
    })
})
