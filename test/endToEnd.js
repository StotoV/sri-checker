const assert = require('assert')

const index = require('../src/index.js')
const scrape = require('../src/scrape.js')

function onlyKeepRelevantFields(input, fields) {
    input.forEach((e) => Object.keys(e).forEach((k) => fields.includes(k) || delete e[k]))
}

describe('End to end tests', function() {
    // TODO: The css alternate tests are skipped for some reason
    it('tests on the W3C test suite', async function() {
        // Arrange
        const expectedResult = [
            {
                // Page load
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": undefined,
                "resourceUsesHttps": undefined,
                "resourceCrossOrigin": false,
                "complete": true,
                "hasIntegrity": false,
                "hasCrossorigin": false,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with unknown algorithm only.
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/script.js?85a283a3-da6c-40e8-b1f1-74c53fdf5426",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": true,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": false,
                "usesUnsupportedHash": true,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with correct hash, options.
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/script.js?9a855f30-ee4b-495a-8810-ca4b7dd86b8e",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": true,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": true,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Cross-origin, empty integrity
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://www.w3c-test.org/subresource-integrity/script.js?3c789646-3cc9-48d9-bff2-4e2c27a8a897&pipe=header(Access-Control-Allow-Origin,*)",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "complete": true,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": true,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Cross-origin, not CORS request, with hash mismatch
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://www.w3c-test.org/subresource-integrity/script.js?fa434823-c4da-4ccd-a1df-1b981b06d678&pipe=header(Access-Control-Allow-Origin,*)",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "complete": true,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": undefined,
                "hasValidCrossorigin": false,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Cross-origin, not CORS request, with correct hash
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://www.w3c-test.org/subresource-integrity/script.js?a88e8455-536e-4fa2-9868-865ddf97f9cc&pipe=header(Access-Control-Allow-Origin,*)",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "complete": true,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": undefined,
                "hasValidCrossorigin": false,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // <crossorigin='anonymous'> with CORS-ineligible resource
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://www.w3c-test.org/subresource-integrity/script.js?eba43ece-a439-4357-a951-b93ba0b4a8cf",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "complete": true,
                "hasIntegrity": true,
                "hasCrossorigin": true,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": undefined,
                "hasValidCrossorigin": false,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // <crossorigin='use-credentials'> with incorrect hash CORS-eligible
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://www.w3c-test.org/subresource-integrity/script.js?837680f5-a30a-4274-a096-6272befc3f8d&pipe=header(Access-Control-Allow-Credentials,true)|header(Access-Control-Allow-Origin,https://w3c-test.org)",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "complete": true,
                "hasIntegrity": true,
                "hasCrossorigin": true,
                "hasValidIntegrity": false,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": true,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // <crossorigin='use-credentials'> with correct hash, CORS-eligible
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://www.w3c-test.org/subresource-integrity/script.js?9f56de4b-8dcc-4d0a-8745-e6fa9b40b7cb&pipe=header(Access-Control-Allow-Credentials,true)|header(Access-Control-Allow-Origin,https://w3c-test.org)",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "complete": true,
                "hasIntegrity": true,
                "hasCrossorigin": true,
                "hasValidIntegrity": true,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": true,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // <crossorigin='anonymous'> with incorrect hash, ACAO: *
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://www.w3c-test.org/subresource-integrity/script.js?479bb453-a073-4942-8fe2-1e5c191b2922&pipe=header(Access-Control-Allow-Origin,*)",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "complete": true,
                "hasIntegrity": true,
                "hasCrossorigin": true,
                "hasValidIntegrity": false,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": true,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // <crossorigin='anonymous'> with correct hash, ACAO: *
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://www.w3c-test.org/subresource-integrity/script.js?92059e85-e8ab-4612-89ed-1ff0bbfcb9eb&pipe=header(Access-Control-Allow-Origin,*)",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "complete": true,
                "hasIntegrity": true,
                "hasCrossorigin": true,
                "hasValidIntegrity": true,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": true,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with sha256 match, sha512 mismatch
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/script.js?920fa99f-d261-41ae-826e-a6948b9519c0",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": true,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": false,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": true,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with sha256 mismatch, sha512 match
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/script.js?c883e2cb-9daa-4bae-beaf-e44eb86a597f",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": true,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": true,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with multiple sha256 hashes, including unknown algorithm.
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/script.js?97f84e84-81bf-4368-8a4d-f3df5f07c2d3",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": true,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": false,
                "usesUnsupportedHash": true,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with multiple sha256 hashes, including correct.
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/script.js?8047517f-a39a-46dd-9e33-3cf272ba65c7",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": true,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": true,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with incorrect hash.
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/script.js?63d04628-2cd7-4cd5-ba26-e0a254b3032d",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": true,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": false,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": true,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with empty integrity.
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/script.js?1c456e91-fc73-4b01-b907-040a673e49be",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": true,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": true,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with correct sha512 hash.
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/script.js?08213a5f-f12e-487d-a7bb-bcf8174fc63f",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": true,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": true,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with correct sha384 hash.
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/script.js?c2bcb0fe-3978-47ae-a5ca-6b76e72c5ab0",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": true,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": true,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with correct sha256 hash.
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/script.js?5e622f32-8d06-4682-a013-337d4b8e1ace",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": true,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": true,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Helper script
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": undefined,
                "resourceUsesHttps": undefined,
                "resourceCrossOrigin": false,
                "complete": true,
                "hasIntegrity": false,
                "hasCrossorigin": false,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with correct sha256 hash, rel='license stylesheet'
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/style.css?13",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": true,
                "hasIntegrity": true,
                "hasCrossorigin": false,
                "hasValidIntegrity": true,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Helper script
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/sri-test-helpers.sub.js",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": true,
                "hasIntegrity": false,
                "hasCrossorigin": false,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Helper script
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/common/utils.js",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": true,
                "hasIntegrity": false,
                "hasCrossorigin": false,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Helper script
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/resources/sriharness.js",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": true,
                "hasIntegrity": false,
                "hasCrossorigin": false,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Helper script
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/resources/testharnessreport.js",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": true,
                "hasIntegrity": false,
                "hasCrossorigin": false,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Helper script
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/resources/testharness.js",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": true,
                "hasIntegrity": false,
                "hasCrossorigin": false,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with correct sha256 hash
                // Note: uncaptured success as it is incomplete and no attributes are available
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/style.css?1",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": false,
                "hasIntegrity": undefined,
                "hasCrossorigin": undefined,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with correct sha384 hash
                // Note: uncaptured success as it is incomplete and no attributes are available
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/style.css?2",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": false,
                "hasIntegrity": undefined,
                "hasCrossorigin": undefined,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with correct sha512 hash
                // Note: uncaptured success as it is incomplete and no attributes are available
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/style.css?3",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": false,
                "hasIntegrity": undefined,
                "hasCrossorigin": undefined,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with empty integrity
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/style.css?4",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": false,
                "hasIntegrity": undefined,
                "hasCrossorigin": undefined,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with incorrect hash
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/style.css?5",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": false,
                "hasIntegrity": true,
                "hasCrossorigin": undefined,
                "hasValidIntegrity": false,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": true,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with multiple sha256 hashes, including correct.
                // Note: uncaptured success as it is incomplete and no attributes are available
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/style.css?6",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": false,
                "hasIntegrity": undefined,
                "hasCrossorigin": undefined,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with multiple sha256 hashes, including unknown algorithm.
                // Note: uncaptured success as it is incomplete and no attributes are available
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/style.css?7",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": false,
                "hasIntegrity": undefined,
                "hasCrossorigin": undefined,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with sha256 mismatch, sha512 match
                // Note: uncaptured success as it is incomplete and no attributes are available
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/style.css?8",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": false,
                "hasIntegrity": undefined,
                "hasCrossorigin": undefined,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with sha256 match, sha512 mismatch
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/style.css?9",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": false,
                "hasIntegrity": true,
                "hasCrossorigin": undefined,
                "hasValidIntegrity": false,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": true,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // <crossorigin='anonymous'> with correct hash, ACAO: *
                // Note: uncaptured success as it is incomplete and no attributes are available
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://www.w3c-test.org/subresource-integrity/crossorigin-anon-style.css?&1",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "complete": false,
                "hasIntegrity": undefined,
                "hasCrossorigin": undefined,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // crossorigin='anonymous'> with incorrect hash, ACAO: *
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://www.w3c-test.org/subresource-integrity/crossorigin-anon-style.css?&2",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "complete": false,
                "hasIntegrity": true,
                "hasCrossorigin": undefined,
                "hasValidIntegrity": false,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": true,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // <crossorigin='use-credentials'> with correct hash, CORS-eligible
                // Note: uncaptured success as it is incomplete and no attributes are available
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://www.w3c-test.org/subresource-integrity/crossorigin-creds-style.css?acao_port=&1",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "complete": false,
                "hasIntegrity": undefined,
                "hasCrossorigin": undefined,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // <crossorigin='use-credentials'> with incorrect hash CORS-eligible
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://www.w3c-test.org/subresource-integrity/crossorigin-creds-style.css?acao_port=&2",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "complete": false,
                "hasIntegrity": true,
                "hasCrossorigin": undefined,
                "hasValidIntegrity": false,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": true,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // <crossorigin='anonymous'> with CORS-ineligible resource
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://www.w3c-test.org/subresource-integrity/crossorigin-ineligible-style.css?&1",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "complete": false,
                "hasIntegrity": undefined,
                "hasCrossorigin": true,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": undefined,
                "hasValidCrossorigin": false,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Cross-origin, not CORS request, with correct hash
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://www.w3c-test.org/subresource-integrity/crossorigin-anon-style.css?&3",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "complete": false,
                "hasIntegrity": true,
                "hasCrossorigin": undefined,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": undefined,
                "hasValidCrossorigin": false,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Cross-origin, not CORS request, with hash mismatch
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://www.w3c-test.org/subresource-integrity/crossorigin-anon-style.css?&4",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "complete": false,
                "hasIntegrity": true,
                "hasCrossorigin": undefined,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": undefined,
                "hasValidCrossorigin": false,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Cross-origin, empty integrity
                // Note: uncaptured success as it is incomplete and no attributes are available
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://www.w3c-test.org/subresource-integrity/crossorigin-anon-style.css?&5",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": true,
                "complete": false,
                "hasIntegrity": undefined,
                "hasCrossorigin": undefined,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with correct hash, options.
                // Note: uncaptured success as it is incomplete and no attributes are available
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/style.css?10",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": false,
                "hasIntegrity": undefined,
                "hasCrossorigin": undefined,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with unknown algorithm only.
                // Note: uncaptured success as it is incomplete and no attributes are available
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/style.css?11",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": false,
                "hasIntegrity": undefined,
                "hasCrossorigin": undefined,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            },
            {
                // Same-origin with correct sha256 hash, rel='stylesheet license
                // Note: uncaptured success as it is incomplete and no attributes are available
                "target": "https://w3c-test.org/subresource-integrity/subresource-integrity.html",
                "pageUsesHttps": true,
                "resource": "https://w3c-test.org/subresource-integrity/style.css?12",
                "resourceUsesHttps": true,
                "resourceCrossOrigin": false,
                "complete": false,
                "hasIntegrity": undefined,
                "hasCrossorigin": undefined,
                "hasValidIntegrity": undefined,
                "usesUnsupportedHash": false,
                "hasMalformedIntegrity": false,
                "hasValidCrossorigin": undefined,
                "hasMultipleIntegrity": undefined,
                "acceptsMultipleResources": undefined
            }
        ]

        // Act
        const { scrapeResult, labelResult } = await scrape(['https://w3c-test.org/subresource-integrity/subresource-integrity.html'])

        const result = labelResult['0']
        onlyKeepRelevantFields(result, ['target', 'complete', 'pageUsesHttps', 'resourceUsesHttps', 'resourceCrossOrigin',
            'hasIntegrity', 'hasCrossorigin', 'hasValidIntegrity',
            'usesUnsupportedHash', 'hasMalformedIntegrity', 'hasValidCrossorigin'])
        onlyKeepRelevantFields(expectedResult, ['target', 'complete', 'pageUsesHttps', 'resourceUsesHttps', 'resourceCrossOrigin',
            'hasIntegrity', 'hasCrossorigin', 'hasValidIntegrity',
            'usesUnsupportedHash', 'hasMalformedIntegrity', 'hasValidCrossorigin'])

        // Assert
        assert.deepEqual(result, expectedResult)
    }).timeout(60000)
})
