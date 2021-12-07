const log = logger.child({module: 'labeler'})

/**
 * @param {ScrapeResult[]} data
 * @returns {LabelData[]}
 */
function label(data) {
    log.verbose('Starting labeling the data')

    var labelDataList = []
    for (const result of data) {
        let labelData = {}

        labelData.origin = result.origin
        labelData.pageUsesHttps = new URL(labelData.origin).protocol == 'https:'
        
        switch (result.element) {
            case 'SCRIPT':
                labelData.resource = result.attributes.src
                break
            case 'LINK':
                labelData.resource = result.attributes.href
                break
            default:
                labelData.resource = undefined
                break
        }

        labelData.resourceUsesHttps = false
        if (labelData.resource != undefined) {
            labelData.resource = new URL(labelData.resource ,labelData.origin).toString()
            labelData.resourceUsesHttps = new URL(labelData.resource).protocol == 'https:'
        }

        labelData.resourceCrossOrigin = labelData.resource != undefined &&
                                        new URL(labelData.origin).origin !=
                                        new URL(labelData.resource).origin

        labelData.hasIntegrity = 'integrity' in result.attributes
        labelData.hasCrossorigin = 'crossorigin' in result.attributes

        for (const log in result.logs) {
            switch (log.text) {
                case "Subresource Integrity: The resource 'http://127.0.0.1:9616/assets/js/some_script.js' has an integrity attribute, but the resource requires the request to be CORS enabled to check the integrity, and it is not. The resource has been blocked because the integrity cannot be enforced.":
                    break

                default:
                    labelData.hasInvalidIntegrity = false
                    labelData.hasMalformedIntegrity = false
                    labelData.hasValidCrossorigin = false
                    break
            }
        }

        labelData.hasMultipleIntegrity = false
        labelData.acceptsMultipleResources = false

        labelDataList.push(labelData)
    }

    log.verbose('Done labeling the data')
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
 *  @property {boolean}     hasMultipleIntegrity
 *  @property {boolean}     acceptsMultipleResources
 *  @property {boolean}     hasValidIntegrity
 *  @property {boolean}     hasInvalidIntegrity
 *  @property {boolean}     hasMalformedIntegrity
 *  @property {boolean}     hasValidCrossorigin
 */
