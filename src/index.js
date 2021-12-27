const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

function initLog(outPath) {
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
            }),
            new transports.File({
                filename: outPath + '/error.log',
                level: 'error',
                format: combine(
                    timestamp(),
                    logFormat
                )
            }),
            new transports.File({
                filename: outPath + '/info.log',
                level: 'info',
                format: combine(
                    timestamp(),
                    logFormat
                )
            }),
            new transports.File({
                filename: outPath + '/verbose.log',
                level: 'verbose',
                format: combine(
                    timestamp(),
                    logFormat
                )
            }),
        ],
    });
    logger.debug('Logging initialized')
}

const fs = require('fs');

/**
 * Runs the full SRI check on the given URL
 *
 * @param    {string[]}    targets  The URLs that will be checked on SRI implementation
 * @param    {string}    outPath    The location where the results will be written. Must be a JSON file
 */
async function checkURL (targets, outPath) {
    initLog(outPath)
    const scrape = require('./scrape.js')

    logger.info('Starting scraping the target(s), output goes to ' + outPath)

    try {
        fs.mkdirSync(outPath, { recursive: true })
    } catch (e) {
        logger.error('Failed to find or create output directory: ' + e)
        process.exit(1)
    }

    const { scrapeResult, labelResult } = await scrape(targets, outPath)

    // const replacer = (key, value) => typeof value === 'undefined' ? null : value
    // await fs.writeFileSync(outPath + '/scrape.json', JSON.stringify(scrapeResult, replacer, 2));
    // await fs.writeFileSync(outPath + '/label.json', JSON.stringify(labelResult, replacer, 2));

    logger.info('Done with scraping the target(s)')
    process.exit(0)
}

module.exports = {
    checkURL: checkURL
}
