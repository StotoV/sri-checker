const log = logger.child({module: 'tagExistence'})

/**
 * Checks the existence of SRI tags on the given elements
 *
 * @param       {Array.<{
 *      'integrity': String,
 *      'cross_origin': String
 * }>}                               elements        The elements to check the tag existence for
 * @returns     {Array.<{
 *      'integrity': boolean,
 *      'cross_origin': boolean
 * }>}                                               The array indicating for each element if they have a integrity and cross origin tag
 *
 * @TODO Discussion: how to handle non-existing integrity/cross-origin tags?
 */
async function tagExistence(elements) {
    log.verbose('Starting tag existence check')
    var out = []
    for (const element of elements) {
        out.push({
            'integrity': element.integrity != null && element.integrity != '',
            'cross_origin': element.cross_origin != null && element.cross_origin != '' 
        })
    }

    log.verbose('Done with tag existence check')
    return out
}

module.exports = tagExistence
