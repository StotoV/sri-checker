const url = require('url')
const { crawler, RequestCollector} = require('tracker-radar-collector');

const SRITagCollector = require('./collectors/SRITagCollector.js')
const LogCollector = require('./collectors/LogCollector.js')

const log = logger.child({module: 'scraper'})

function getMatchingNetworkRequests(origin, tag, requests) {
    var matchedNetworkRequests = []
    for (const request of requests) {
        if (request.url === tag.attributes.href ||
            request.url === tag.attributes.src||
            request.url === origin + tag.attributes.href ||
            request.url === origin + tag.attributes.src) {
            matchedNetworkRequests.push(request)
        }
    }

    return matchedNetworkRequests
}

function getMatchingLogs(origin, tag, logs) {
    var matchedLogs = []
    for (const log of logs) {
        if (log.text.includes(tag.attributes.href) ||
            log.text.includes(tag.attributes.src) ||
            log.text.includes(origin + tag.attributes.href) ||
            log.text.includes(origin + tag.attributes.src) ||

            log.url === tag.attributes.href ||
            log.url === tag.attributes.src ||
            log.url === origin + tag.attributes.href ||
            log.url === origin + tag.attributes.src ||

            log.text.includes(tag.attributes.integrity)) {
            matchedLogs.push(log)
        }
    }

    return matchedLogs
}

/**
 * Scrapes the given URL on SRI relevant tags
 *
 * @param       {string}    URL         The URL that will be scraped
 * @returns     {ScrapeResult[]}  The scraped elements in JSON format
 *
 */
async function scrape(URL) {
    log.verbose('Starting scraping ' + URL)

    const collectors = [new RequestCollector(), new LogCollector(), new SRITagCollector()]
    const collectedData = await crawler(new url.URL(URL), {
        collectors: collectors,
        log: (msg) => {log.verbose('[Crawler] ' + msg)},
        runInEveryFrame: true,
        executablePath: '/usr/bin/chromium' // To be removed if at all possible
    })

    var out = []
    for (const tag of collectedData.data.SRITag) {
        tag['requests'] = getMatchingNetworkRequests(URL, tag, collectedData.data.requests)
        tag['logs'] = getMatchingLogs(URL, tag, collectedData.data.logs)

        out.push(tag)
    }

    log.verbose('Done scraping ' + URL)
    return out
}

module.exports = scrape

/**
 * @typedef {object} ScrapeResult
 *
 * @property {string} element
 * @property {TagAttributes[]} attributes
 * @property {RequestData[]} requests
 * @property {LogData[]} logs
 */

/**
 * @typedef {require('tracker-radar-collector').RequestCollector.RequestData} RequestData
 */
