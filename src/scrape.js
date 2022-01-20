const { crawler, RequestCollector} = require('tracker-radar-collector')
const os = require('os')
const cores = os.cpus().length
const fs = require('fs')
const async = require('async')

const SRITagCollector = require('./collectors/SRITagCollector.js')
const LogCollector = require('./collectors/LogCollector.js')
const label = require('./label.js')

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

            (!!tag.attributes.integrity && log.text.includes("'" + tag.attributes.integrity + "'"))) {
            matchedLogs.push(log)
        }
    }

    return matchedLogs
}

async function dataProcesser(target, collectedData) {
    var tags = []
    var unmatchedNetworkRequests = [...collectedData.data.requests]
    var unmatchedLogs = [...collectedData.data.logs]
    for (const tag of collectedData.data.SRITag) {
        tag['complete'] = true
        tag['target'] = target
        tag['requests'] = getMatchingNetworkRequests(tag, collectedData.data.requests)
        tag['logs'] = getMatchingLogs(tag, collectedData.data.logs)

        unmatchedNetworkRequests = unmatchedNetworkRequests.filter(request => {return !tag['requests'].includes(request)})
        unmatchedLogs = unmatchedLogs.filter(logEntry => {return !tag['logs'].includes(logEntry)})

        tags.push(tag)
    }

    const len = unmatchedNetworkRequests.length
    for (var i=0;i<len;i++) {
        const request = unmatchedNetworkRequests.shift()
        if (request.type == 'Script' || request.type == 'Stylesheet') {
            var tag = {
                target: target,
                document: request.initiators[0],
                attributes: {},
                complete: false
            }
            if (request.type == 'Script') {
                tag.element = 'SCRIPT'
                tag.attributes.src = request.url
            } else if (request.type == 'Stylesheet') {
                tag.element = 'LINK'
                tag.attributes.href = request.url
            }
            tag['requests'] = [request]
            tag['logs'] = getMatchingLogs(tag, unmatchedLogs)

            unmatchedLogs = unmatchedLogs.filter(logEntry => {return !tag['logs'].includes(logEntry)})
            
            tags.push(tag)
        } else {
            unmatchedNetworkRequests.push(request)
        }
    }

    const scrapeResult = {
        tags: tags,
        unmatched: {
            requests: unmatchedNetworkRequests,
            logs: unmatchedLogs
        }
    }
    const labelResult = await label(target, scrapeResult.tags)

    return { scrapeResult: scrapeResult, labelResult: labelResult }
}

/**
 * Scrapes the given URL on SRI relevant tags
 *
 * @param       {string}                            targets     The URLs that will be scraped
 * @returns     {ScrapeResult[], LabelResult[]}
 *
 */
async function scrape(targets, outPath) {
    workers = cores - 1
    log.verbose('Number or workers: ' + workers)
    log.verbose('Number of targets: ' + targets.length)

    var labelOut = {}
    var scrapeOut = {}
    await async.eachOfLimit(targets, workers, async (target, idx, callback) => {
        try {
            const collectors = [new RequestCollector(), new LogCollector(), new SRITagCollector()]
            const collectedData = await crawler(new URL(target), {
                collectors: collectors,
                log: (msg) => {log.verbose('[Scraper]['+ idx + '] ' + msg)},
                runInEveryFrame: true,
                executablePath: '/usr/bin/chromium' // To be removed if at all possible
            })

            const { scrapeResult, labelResult } = await dataProcesser(target, collectedData)
            // scrapeOut[idx] = scrapeResult
            // labelOut[idx] = labelResult

            // var filename = btoa(target)
	    var filename = Buffer.from(target).toString('base64')
            filename = filename.replace('\/', '-')
            const replacer = (key, value) => typeof value === 'undefined' ? null : value
            await fs.writeFileSync(outPath + '/' + filename + '_scrape.json', JSON.stringify(scrapeResult, replacer, 2));
            await fs.writeFileSync(outPath + '/' + filename + '_label.json', JSON.stringify(labelResult, replacer, 2));
        } catch (e) {
            log.error('[Scraper][' + idx + '] ' + target + ' ' + e)
        }
    })

    return { scrapeResult:  scrapeOut, labelResult: labelOut }
}

module.exports = scrape

/**
 * @typedef {object} ScraperOutput
 *
 * @property {ScrapeResult[]}                               tags
 * @property {{requests: RequestData[], logs: LogData[]}}   unmatched
 */

/**
 * @typedef {object} ScrapeResult
 *
 * @property {string}           target
 * @property {string}           element         Element type of the tag (STRING or LINK)
 * @property {TagAttributes[]}  attributes      List of attributes of the tag
 * @property {boolean}          complete      If the tag is foud via the DOM or via an unmatched network request
 * @property {string}           document        Document URL of that the tag was found in
 * @property {RequestData[]}    requests
 * @property {LogData[]}        logs
 */

/**
 * @typedef {require('tracker-radar-collector').RequestCollector.RequestData} RequestData
 */
