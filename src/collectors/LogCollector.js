const BaseCollector = require('./BaseCollector.js')

class LogCollector {
    id() {
        return 'logs'
    }

    /**
     * @param {BaseCollector.CollectorInitOptions} options
     */
    init({
        log,
    }) {
        this._log = log
    }

    /**
     * @param {{cdpClient: require('puppeteer').CDPSession, url: string, type: require('tracker-radar-collector').TargetCollector.TargetType}} targetInfo
     */
    addTarget({cdpClient, type}) {
        this._cdpClient = cdpClient
    }

    /**
     * @returns {LogData[]}
     */
    async getData() {
        var logEntries = []
        this._cdpClient.on('Log.entryAdded', async ({entry}) => {
            logEntries.push(entry)
        })

        await this._cdpClient.send('Log.enable')

        this._log(JSON.stringify(logEntries, null, 2))
        return logEntries
    }
}

module.exports = LogCollector

/**
 * @typedef {object} LogData
 *
 * @property {string} source
 * @property {string} level
 * @property {string} text
 * @property {string} url
 * @property {string=} category
 */
