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
 * @param    {string}    URL        The URL that will be checked on SRI implementation
 * @param    {string}    outPath    The location where the results will be written. Must be a JSON file
 *
 * @TODO             Add input validation on params
 * @TODO             Create destination dir if it does not exist
 */
async function checkURL (URL, outPath) {
    logger.verbose('checkURL called with URL: ' + URL + ' and outPath: ' + outPath)

    const scrapeResult = await scrape(URL)
    // await fs.writeFileSync(outPath + 'scrape.json', out);

    const labelResult = await label(scrapeResult)
    logger.verbose(JSON.stringify(labelResult, null, 2))
    // await fs.writeFileSync(outPath + 'label.json', out);

    logger.verbose('Done with all tests for URL: ' + URL)
    process.exit(0)
}

module.exports = {
    checkURL: checkURL,
    scrape: scrape,
    label: label,
}
