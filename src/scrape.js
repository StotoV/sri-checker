const { crawler, RequestCollector} = require('tracker-radar-collector');

const SRITagCollector = require('./collectors/SRITagCollector.js')
const LogCollector = require('./collectors/LogCollector.js')

const log = logger.child({module: 'scraper'})

function getMatchingNetworkRequests(tag, requests) {
    var matchedNetworkRequests = []

    for (const request of requests) {
        if ((tag.attributes.src && request.url === new URL(tag.attributes.src, tag.document).toString()) ||
            (tag.attributes.href && request.url === new URL(tag.attributes.href, tag.document).toString())) {
            matchedNetworkRequests.push(request)
        }
    }

    return matchedNetworkRequests
}

function getMatchingLogs(tag, logs) {
    var matchedLogs = []
    for (const log of logs) {
        if (log.text.includes(tag.attributes.href) ||
            log.text.includes(tag.attributes.src) ||
            (tag.attributes.href && log.text.includes(new URL(tag.attributes.href, tag.document).toString())) ||
            (tag.attributes.src && log.text.includes(new URL(tag.attributes.src, tag.document).toString())) ||

            (tag.attributes.src && log.url === new URL(tag.attributes.src, tag.document).toString()) ||
            (tag.attributes.href && log.url === new URL(tag.attributes.href, tag.document).toString()) ||

            log.text.includes(tag.attributes.integrity)) {
            matchedLogs.push(log)
        }
    }

    return matchedLogs
}

/**
 * Scrapes the given URL on SRI relevant tags
 *
 * @param       {string}    target      The URL that will be scraped
 * @returns     {ScrapeResult[]}        The scraped elements in JSON format
 *
 */
async function scrape(target) {
    log.verbose('Starting scraping ' + target)

    const collectors = [new RequestCollector(), new LogCollector(), new SRITagCollector()]
    const collectedData = await crawler(new URL(target), {
        collectors: collectors,
        log: (msg) => {log.verbose('[Crawler] ' + msg)},
        runInEveryFrame: true,
        executablePath: '/usr/bin/chromium' // To be removed if at all possible
    })

    var out = []
    for (const tag of collectedData.data.SRITag) {
        tag['target'] = target
        tag['requests'] = getMatchingNetworkRequests(tag, collectedData.data.requests)
        tag['logs'] = getMatchingLogs(tag, collectedData.data.logs)

        out.push(tag)
    }

    log.verbose(JSON.stringify(collectedData, null, 2))
    log.verbose('Done scraping ' + target)
    return out
}

module.exports = scrape

/**
 * @typedef {object} ScrapeResult
 *
 * @property {string}           target
 * @property {string}           element         Element type of the tag (STRING or LINK)
 * @property {TagAttributes[]}  attributes      List of attributes of the tag
 * @property {string}           document        Document URL of that the tag was found in
 * @property {RequestData[]}    requests
 * @property {LogData[]}        logs
 */

/**
 * @typedef {require('tracker-radar-collector').RequestCollector.RequestData} RequestData
 */
