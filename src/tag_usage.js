const log = logger.child({module: 'tagExistence'})

/**
 * Checks the usage of SRI tags on the given elements
 *
 * @param       {Array.<{
 *      'integrity': String,
 *      'cross_origin': String
 * }>}                               elements        The elements to check the tag existence for
 * @returns     {Array.<{
 *      'integrity': boolean,
 *      'cross_origin': boolean
 * }>}                                               The array indicating for each element if they have an non-empty integrity and cross origin tag
 *
 */
async function tagUsage(elements) {
    log.verbose('Starting tag usage check')
    
    var out = []
    for (const element of elements) {
        out.push({
            'integrity': 'integrity' in element && element.integrity != null && element.integrity != '',
            'cross_origin': 'cross_origin' in element && element.cross_origin != null && element.cross_origin != '' 
        })
    }

    log.verbose('Done with tag usage check')
    return out
}

module.exports = tagUsage
