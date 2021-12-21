const assert = require('assert')
const sinon = require('sinon')
const fs = require('fs')
const rdiff = require('recursive-diff');
// const mock = require('mock-fs')

const { checkURL } = require('../src/index.js')

function onlyKeepRelevantFields(input, fields) {
    input.forEach((e) => Object.keys(e).forEach((k) => fields.includes(k) || delete e[k]))
}

describe('End to end tests', function() {
    before(function() {
        sinon.stub(process, 'exit')
        // mock({
        //     'output': {
        //         'scrape.json': '',
        //         'label.json': '',
        //     },
        // });
    }),

    after(function() {
        // mock.restore();
    }),

    it('tests on the W3C test suite', async function() {
        // Arrange
        const expectedResult = [
            {
                // Page load via script
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": false,
                "resourceCrossOrigin": false,
                "hasIntegrity": false,
                "hasCrossorigin": false,
                "hasValidIntegrity": null,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": null
            },
            {
                // Same-origin with unknown algorithm only
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": false,
                "usesUnsupportedHash": true,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": null
            },
            {
                // Same-origin with correct hash, options
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": true,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": null
            },
            {
                // Cross-origin, empty integrity
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": true,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": null
            },
            {
                // Cross-origin, not CORS request, with hash mismatch
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": null,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": null,
                "hasValidCrossorigin": false
            },
            {
                // Cross-origin, not CORS request, with correct hash
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": null,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": null,
                "hasValidCrossorigin": false
            },
            {
                // <crossorigin='anonymous'> with CORS-ineligible resource
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "hasIntegrity": true,
                "hasCrossorigin": true,
                "hasValidIntegrity": null,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": null,
                "hasValidCrossorigin": false
            },
            {
                // <crossorigin='use-credentials'> with incorrect hash CORS-eligible
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "hasIntegrity": true,
                "hasCrossorigin": true,
                "hasValidIntegrity": false,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": true
            },
            {
                // <crossorigin='use-credentials'> with correct hash, CORS-eligible
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "hasIntegrity": true,
                "hasCrossorigin": true,
                "hasValidIntegrity": true,
                "usesUnsupportedHash": true,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": true
            },
            {
                // <crossorigin='anonymous'> with incorrect hash, ACAO: *
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "hasIntegrity": true,
                "hasCrossorigin": true,
                "hasValidIntegrity": false,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": true
            },
            {
                // <crossorigin='anonymous'> with correct hash, ACAO: *
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "hasIntegrity": true,
                "hasCrossorigin": true,
                "hasValidIntegrity": true,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": true
            },
            {
                // Same-origin with sha256 match, sha512 mismatch
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": false,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": true
            },
            {
                // Same-origin with sha256 mismatch, sha512 match
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": true,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": null
            },
            {
                // TODO: Check
                // Same-origin with multiple sha256 hashes, including unknown algorithm.
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": true,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": null
            },
            {
                // Same-origin with multiple sha256 hashes, including correct
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": true,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": null
            },
            {
                // Same-origin with incorrect hash
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": false,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": true
            },
            {
                // Same-origin with empty integrity
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": true,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": null
            },
            {
                // Same-origin with correct sha512 hash
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": true,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": null
            },
            {
                // Same-origin with correct sha384 hash
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": true,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": null
            },
            {
                // Same-origin with correct sha256 hash
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": false,
                "usesUnsupportedHash": true,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": null
            },
            {
                // Some random script tag
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": false,
                "resourceCrossOrigin": false,
                "hasIntegrity": false,
                "hasCrossorigin": false,
                "hasValidIntegrity": null,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": null
            },
            {
                // Same-origin with sha256 match, sha512 mismatch
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": false,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": null
            },
            {
                // Helper script
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "hasIntegrity": false,
                "hasCrossorigin": false,
                "hasValidIntegrity": null,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": null
            },
            {
                // Helper script
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "hasIntegrity": false,
                "hasCrossorigin": false,
                "hasValidIntegrity": null,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": null
            },
            {
                // Helper script
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "hasIntegrity": false,
                "hasCrossorigin": false,
                "hasValidIntegrity": false,
                "usesUnsupportedHash": true,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": null
            },
            {
                // Helper script
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "hasIntegrity": false,
                "hasCrossorigin": false,
                "hasValidIntegrity": null,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": null
            },
            {
                // Helper script
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "hasIntegrity": false,
                "hasCrossorigin": false,
                "hasValidIntegrity": null,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": null
            }
        ]

        // Act
        await checkURL(['https://w3c-test.org/subresource-integrity/subresource-integrity.html'], './output')
        var result = JSON.parse(fs.readFileSync('./output/label.json', 'utf8'))
        console.log(JSON.stringify(result, null, 2))
        result = result.labelResult[0]
        console.log(JSON.stringify(result, null, 2))
        onlyKeepRelevantFields(result, ['target', 'pageUsesHttps', 'resourceUsesHttps', 'resourceCrossOrigin',
                                        'hasIntegrity', 'hasCrossorigin', 'hasValidIntegrity',
                                        'usesUnsupportedHash', 'hasMalformedIntegrity', 'hasValidCrossorigin'])

        // Assert
        console.log(rdiff.getDiff(result, expectedResult))
        assert.deepEqual(result, expectedResult)
    }).timeout(60000)
})
