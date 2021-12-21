const log = logger.child({module: 'labeler'})

/**
 * @param {string}          target
 * @param {ScrapeResult[]}  data
 * @returns {LabelData[]}
 */
function label(target, data) {
    log.verbose('[Labeler] Starting labeling job for ' + target)

    var labelDataList = []
    for (const result of data) {
        let labelData = {}

        labelData.target = result.target
        labelData.pageUsesHttps = new URL(labelData.target).protocol == 'https:'
        
        labelData.resource = undefined
        switch (result.element) {
            case 'SCRIPT':
                labelData.resource = result.attributes.src
                break
            case 'LINK':
                labelData.resource = result.attributes.href
                break
        }

        labelData.resourceUsesHttps = false
        if (labelData.resource != undefined) {
            labelData.resource = new URL(labelData.resource ,labelData.target).toString()
            labelData.resourceUsesHttps = new URL(labelData.resource).protocol == 'https:'
        }

        labelData.resourceCrossOrigin = labelData.resource != undefined &&
                                        new URL(labelData.target).origin !=
                                        new URL(labelData.resource).origin

        labelData.hasIntegrity = 'integrity' in result.attributes
        labelData.hasCrossorigin = 'crossorigin' in result.attributes

        labelData.hasValidIntegrity = labelData.hasIntegrity ? true : undefined
        labelData.usesUnsupportedHash = false
        labelData.hasMalformedIntegrity = false
        labelData.hasValidCrossorigin = labelData.hasCrossorigin ? true : undefined
        for (const message of result.logs) {

            if (RegExp("^Subresource Integrity: The resource '.*' has an integrity attribute, but the resource requires the request to be CORS enabled to check the integrity, and it is not\. The resource has been blocked because the integrity cannot be enforced\.$").test(message.text)) {
                labelData.hasIntegrity = true
                labelData.hasValidIntegrity = undefined
                labelData.usesUnsupportedHash = false
                labelData.hasMalformedIntegrity = undefined
                labelData.hasCrossorigin = true
                labelData.hasValidCrossorigin = false
                break
            }

            else if (RegExp("^Access to (script|CSS stylesheet){1} at '.*' from origin '.*' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '\\*' when the request's credentials mode is 'include'\.$").test(message.text)) {
                labelData.hasValidIntegrity = undefined
                labelData.usesUnsupportedHash = false
                labelData.hasMalformedIntegrity = undefined
                labelData.hasCrossorigin = true
                labelData.hasValidCrossorigin = false
                break
            }

            else if(RegExp("^Access to (script|CSS stylesheet) at '.*' from origin '.*' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource\.$").test(message.text)) {
                labelData.hasValidIntegrity = undefined
                labelData.usesUnsupportedHash = false
                labelData.hasMalformedIntegrity = undefined
                labelData.hasCrossorigin = true
                labelData.hasValidCrossorigin = false
                break
            }
                
            else if (RegExp("^Failed to find a valid digest in the 'integrity' attribute for resource '.*' with computed SHA-(256|384|512){1} integrity '.*'\. The resource has been blocked\.$").test(message.text)) {
                labelData.hasIntegrity = true
                labelData.hasValidIntegrity = false
                labelData.usesUnsupportedHash = false
                labelData.hasMalformedIntegrity = false
                labelData.hasValidCrossorigin = true
                break
            }

            else if (RegExp("^Error parsing 'integrity' attribute \\('.*'\\)\. The specified hash algorithm must be one of 'sha256', 'sha384', or 'sha512'\.$").test(message.text)) {
                labelData.hasIntegrity = true
                labelData.hasValidIntegrity = false
                labelData.usesUnsupportedHash = true
                labelData.hasMalformedIntegrity = false
                labelData.hasValidCrossorigin = labelData.hasCrossorigin ? true : undefined
                break
            }

            else if (RegExp("^Error parsing 'integrity' attribute \\('.*'\\)\. The hash algorithm must be one of 'sha256', 'sha384', or 'sha512', followed by a '-' character\.$").test(message.text)) {
                labelData.hasIntegrity = true
                labelData.hasValidIntegrity = false
                labelData.usesUnsupportedHash = false
                labelData.hasMalformedIntegrity = true
                labelData.hasValidCrossorigin = labelData.hasCrossorigin ? true : undefined
                break
            }
        }

        labelData.hasMultipleIntegrity = undefined
        labelData.acceptsMultipleResources = undefined

        labelDataList.push(labelData)
    }

    log.verbose('[Labeler] Done with labeling job for ' + target)
    return labelDataList
}

module.exports = label

/**
 *  @typedef {object} LabelData
 *
 *  @property {string}      origin
 *  @property {string}      resource
 *  @property {boolean}     pageUsesHttps
 *  @property {boolean}     resourceUsesHttps
 *  @property {boolean}     resourceCrossOrigin
 *  @property {boolean}     hasIntegrity
 *  @property {boolean}     hasCrossorigin
 *  @property {boolean}     hasValidIntegrity
 *  @property {boolean}     hasInvalidIntegrity
 *  @property {boolean}     hasMalformedIntegrity
 *  @property {boolean}     usesUnsupportedHash
 *  @property {boolean}     hasValidCrossorigin
 *  @property {boolean}     hasMultipleIntegrity
 *  @property {boolean}     acceptsMultipleResources
 */
