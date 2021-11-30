class LogCollector {
    id() {
        return 'consoleError'
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
     * @param {{cdpClient: import('puppeteer').CDPSession, url: string, type: TargetCollector.TargetType}} targetInfo
     */
    addTarget({cdpClient, type}) {
        this._cdpClient = cdpClient
    }

    /**
     * @returns {}
     */
    async getData(options) {
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
