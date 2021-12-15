// CONFIG Logger
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});
global.logger = createLogger({
    level: 'debug',
    format: combine(
        timestamp(),
        logFormat
    ),
    transports: [
        new transports.Console({
            format: combine(
                timestamp(),
                logFormat
            )
        })
    ],
});
logger.debug('Logging initialized')
// END CONFIG logger

const scrape = require('./scrape.js')
const label = require('./label.js')
const fs = require('fs');

/**
 * Runs the full SRI check on the given URL
 *
 * @param    {string}    target     The URL that will be checked on SRI implementation
 * @param    {string}    outPath    The location where the results will be written. Must be a JSON file
 *
 * @TODO             Add input validation on params
 * @TODO             Create destination dir if it does not exist
 */
async function checkURL (target, outPath) {
    logger.verbose('checkURL called with URL: ' + target + ' and outPath: ' + outPath)

    try {
        const u = new URL(target)
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
            throw 'Invalid protocol for given target.'
        }
    } catch (e) {
        logger.error('URL could not be parsed: ' + e)
        process.exit(1)
    }

    try {
        fs.mkdirSync(outPath, { recursive: true })
    } catch (e) {
        logger.error('Failed to find or create directory: ' + e)
        process.exit(1)
    }

    const replacer = (key, value) => typeof value === 'undefined' ? null : value

    const scrapeResult = await scrape(target)
    await fs.writeFileSync(outPath + '/scrape.json', JSON.stringify(scrapeResult, replacer, 2))

    const labelResult = await label(scrapeResult.tags)
    await fs.writeFileSync(outPath + '/label.json', JSON.stringify(labelResult, replacer, 2))

    logger.verbose('Done with all tests for URL: ' + target)
    process.exit(0)
}

module.exports = {
    checkURL: checkURL,
    scrape: scrape,
    label: label,
}
