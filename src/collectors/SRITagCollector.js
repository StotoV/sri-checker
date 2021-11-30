class SRITagCollector {
    id() {
        return 'SRITag'
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
     * @param {{cdpClient: import('puppeteer').CDPSession, url: string, type: import('tracker-radar-collector').TargetCollector.TargetType}} targetInfo
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

module.exports = SRITagCollector
