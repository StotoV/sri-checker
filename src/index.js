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
const usage = require('./tag_usage.js')
const fs = require('fs');

/**
 * Runs the full SRI check on the given URL
 *
 * @param    {String}    URL        The URL that will be checked on SRI implementation
 * @param    {String}    outPath    The location where the results will be written. Must be a JSON file
 *
 * @TODO             Add input validation on params
 */
async function checkURL (URL, outPath) {
    logger.verbose('checkURL called with URL: ' + URL + ' and outPath: ' + outPath)

    var out = JSON.stringify(await scrape(URL))
    await fs.writeFileSync(outPath + 'scrape.json', out);

    out = JSON.stringify(await usage(out))
    await fs.writeFileSync(outPath + 'usage.json', out);

    logger.verbose('Done with all tests for URL: ' + URL)
}

module.exports = {
    checkURL: checkURL,
    tagUsage: usage
}
