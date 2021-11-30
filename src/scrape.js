const url = require('url')
const puppeteer = require('puppeteer')
const { crawler, BaseCollector, TargetCollector, RequestCollector} = require('tracker-radar-collector');
const log = logger.child({module: 'scraper'})


class SRITagCollector {
    id() {
        return 'SRI tags'
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
        await this._cdpClient.send('Page.enable')
        await this._cdpClient.send('DOM.enable')

        const nodeTree = await this._cdpClient.send('DOM.getDocument', {depth: -1, pierce: true})
        var nodes = []
        var treeTraverseQueue = [nodeTree.root]
        for (var node; node = treeTraverseQueue.pop();) {
            if (node.nodeName == 'SCRIPT' ||
                node.nodeName == 'LINK') {
                nodes.push({element: node.nodeName, nodeId: node.nodeId})
            }

            if ('children' in node) {
                treeTraverseQueue = treeTraverseQueue.concat(node.children)
            }
            if ('contentDocument' in node) {
                treeTraverseQueue = treeTraverseQueue.concat(node.contentDocument)
            }
        }

        var nodeAttrs = []
        for (const node of nodes) {
            const rawAttrs = await this._cdpClient.send('DOM.getAttributes', {nodeId: node.nodeId})
            var attrs = {}
            for (var i=0; i < Math.floor((rawAttrs.attributes.length/2)); i+=2) {
                attrs[rawAttrs.attributes[i]] = rawAttrs.attributes[i+1]
            }

            nodeAttrs.push({
                element: node.element,
                attributes: attrs
            })
        }

        return nodeAttrs
    }
}

/**
 * Scrapes the given URL on SRI relevant tags
 *
 * @param       {String}    URL         The URL that will be scraped
 * @returns     {Array.<{
 *      'element': String,
 *      'attributes': {
     *      'type': (String|undefined),
     *      'integrity': (String|undefined),
     *      'cross_origin': (String|undefined),
     *      'referrerpolicy': (String|undefined),
     *      'defer': (String|undefined),
     *      'src': (String|undefined),
     *      'href': (String|undefined),
     *      'async': (String|undefined),
     *      'nomodule': (String|undefined),
     *      'title': (String|undefined),
     *      'media': (String|undefined),
     *      'sizes': (String|undefined),
     *      'rel': (String|undefined),
     *      'hreflang': (String|undefined)
     *  },
     *  'requests': {}
 * }>}                                  The scraped elements in JSON format
 *
 * @TODO        Do not include tags with no url
 * @TODO        Do not include tags with URL on same server
 * @TODO        Also scrape other subresouces (a, img, iframe, ...)
 */
async function scrape(URL) {
    log.verbose('Starting scraping ' + URL)
    var out = []

    const collectors = [new RequestCollector(), new SRITagCollector()]
    const res = await crawler(new url.URL(URL), {
        collectors: collectors,
        log: (msg) => {log.verbose('[Crawler] ' + msg)},
        runInEveryFrame: true,
        executablePath: '/usr/bin/chromium'
    })

    log.verbose(JSON.stringify(res, null, 2))

    log.verbose('Done scraping ' + URL)
    return out
}

module.exports = scrape
