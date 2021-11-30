const url = require('url')
const { crawler, RequestCollector} = require('tracker-radar-collector');

const SRITagCollector = require('./collectors/SRITagCollector.js')
const LogCollector = require('./collectors/LogCollector.js')

const log = logger.child({module: 'scraper'})

/**
 * Scrapes the given URL on SRI relevant tags
 *
 * @param       {String}    URL         The URL that will be scraped
 * @returns     {Array.<{
 *      'element': String,
 *      'attributes': {
 *          'type': (String|undefined),
 *          'integrity': (String|undefined),
 *          'crossorigin': (String|undefined),
 *          'referrerpolicy': (String|undefined),
 *          'defer': (String|undefined),
 *          'src': (String|undefined),
 *          'href': (String|undefined),
 *          'async': (String|undefined),
 *          'nomodule': (String|undefined),
 *          'title': (String|undefined),
 *          'media': (String|undefined),
 *          'sizes': (String|undefined),
 *          'rel': (String|undefined),
 *          'hreflang': (String|undefined)
 *      },
 *      'requests': {}
 * }>}                                  The scraped elements in JSON format
 *
 * @TODO        Do not include tags with no url
 * @TODO        Do not include tags with URL on same server
 * @TODO        Also scrape other subresouces (a, img, iframe, ...)
 */
async function scrape(URL) {
    log.verbose('Starting scraping ' + URL)

    const collectors = [new RequestCollector(), new LogCollector(), new SRITagCollector()]
    var out = await crawler(new url.URL(URL), {
        collectors: collectors,
        log: (msg) => {log.verbose('[Crawler] ' + msg)},
        runInEveryFrame: true,
        executablePath: '/usr/bin/chromium'
    })

    log.verbose(JSON.stringify(out, null, 2))
    out = out.data.SRITag
    log.verbose('Done scraping ' + URL)
    return out
}

module.exports = scrape
