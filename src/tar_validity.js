const log = logger.child({module: 'scraper'})
const https = require('https')
const urlParser = require('url-parse')

/**
 * Checks the validity of SRI tags on the given elements
 *
 * @param       {Array.<{
 *      'integrity': String,
 *      'cross_origin': String
 * }>}                               elements       The elements to check the tag validity for
 * @returns     {Array.<{
 *      'recommendations': Array.<{
 *          'severity': Integer,
 *          'recommendation': String
 *      }>,
 *      'error': String
 * >}                   The array indicating for each element if they have are valid
 *
 * @TODO        Update docs
 * @TODO        Add recommendations/warnings/errors for the user
 *
 */
async function tagValidity(origin, elements) {
    log.verbose('Starting tag validity check')

    for (const element of elements) {
        const attributes = getAttributes(element)
        const { headers, body } = fetchResource(attributes.url)
        const eligible = checkResponseEligibility(origin, attributes.url, headers)
        const metadata = parseMetadata(element)
        const hashes = checkHashes(metadata, body)
    }

    log.verbose('Done with tag existence check')
    return out
}

function checkAttributes(element) {
    var out = {
        url: none,
        integrity: none,
        cross_origin: none
    }

    switch (element.element) {
        case 'script':
            if ('src' in element && element.src !== '') {
                out.url = element.src
            }
            break

        case 'link':
            if ('href' in element && element.href !== '') {
                out.url = element.href
            }
            break

        default:
            throw new Error('No source URL specified')
    }

    return out
}

function fetchResource(url) {
    https.get(url, function(response) {
        const headers = response.headers
        const data = response.data
        return {headers, data}
    })
}

/**
 *
 * @TODO Finish this and the tests
 */
function checkResponseEligibility(origin, url, headers) {
    const parsedOrigin = new urlParser(origin)
    const parsedUrl = new urlParser(url)
    if (parsedOrigin.origin == parsedUrl.origin) {
        return true
    }

    return false
}

function parseMetadata(integrity) {
    return ''
}

/**
 *
 * @TODO Add improvement messages
 *  * Weak hashing algo
 *  * Not all hashes match, it will accept multiple resources
 */
function checkHashes(metadata, resource) {
    // For each metadata
        // Compute hash resource
        // Compare hash with metadata hash
    return true
}

module.exports = tagValidity
