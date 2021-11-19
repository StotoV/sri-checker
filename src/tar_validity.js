const log = logger.child({module: 'scraper'})

/**
 * Checks the validity of SRI tags on the given elements
 *
 * @param       {Array.<{
 *      'integrity': String,
 *      'cross_origin': String
 * }>}                               elements       The elements to check the tag validity for
 * @returns     {Array.<boolean>}                   The array indicating for each element if they have are valid
 *
 */
async function scrape(URL) {
    log.verbose('Starting tag validity check')
    var out = []
    log.verbose('Done with tag existence check')
    return out
}

module.exports = scrape
