module.exports = class Scraper {
    puppeteer = require('puppeteer')
    log = require('winston').child({module: 'scraper'})
    page = null

    constructor() {}

    async init() {
        const browser = this.puppeteer.launch({
            headless: true,
            executablePath: '/usr/bin/chromium'
        })
        this.page = browser.newPage()
    }

    /**
     * Scrapes the given URL on SRI relevant tags
     *
     * @param       {String}    URL         The URL that will be scraped
     * @returns     {Array.<{
     *      'element': String,
     *      'type': String,
     *      'integrity': String,
     *      'cross_origin': String,
     *      'referrerpolicy': String,
     *      'defer': String,
     *      'src': (String|undefined),
     *      'href': (String|undefined),
     *      'async': (String|undefined),
     *      'nomodule': (String|undefined),
     *      'title': (String|undefined),
     *      'media': (String|undefined),
     *      'sizes': (String|undefined),
     *      'rel': (String|undefined),
     *      'hreflang': (String|undefined)
     * }>}                                  The scraped elements in JSON format
     *
     * @TODO        Also scrape other subresouces (a, img, iframe, ...)
     */
    async scrape(URL) {
        const browser = this.puppeteer.launch({
            headless: true,
            executablePath: '/usr/bin/chromium'
        })
        this.page = browser.newPage()
        
        if (this.page == null) {
            throw new Error('Initialize the scraper before first use')
        }

        this.log.verbose('Starting scraping ' + URL)

        await this.page.goto(URL);

        var tags = await page.evaluate(()=>{
            console.log('in here')
            var out = []
            var scripts = document.querySelectorAll('script')
            for (const script of scripts) {
                out.push({
                    'element': 'script',
                    'type': script.getAttribute('type'),
                    'src': script.getAttribute('src'),
                    'integrity': script.getAttribute('integrity'),
                    'cross_origin': script.getAttribute('cross-origin'),
                    'referrerpolicy': script.getAttribute('referrerpolicy'),
                    'async': script.getAttribute('async'),
                    'defer': script.getAttribute('defer'),
                    'nomodule': script.getAttribute('nomodule')
                })
            }

            var links = document.querySelectorAll('link')
            for (const link of links) {
                out.push({
                    'element': 'link',
                    'title': link.getAttribute('title'),
                    'type': link.getAttribute('type'),
                    'media': link.getAttribute('media'),
                    'sizes': link.getAttribute('sizes'),
                    'rel': link.getAttribute('rel'),
                    'href': link.getAttribute('href'),
                    'hreflang': link.getAttribute('hreflang'),
                    'integrity': link.getAttribute('integrity'),
                    'cross_origin': link.getAttribute('cross-origin'),
                    'referrerpolicy': link.getAttribute('referrerpolicy')
                })
            }

            return out
        })

        // browser.close()
        this.log.verbose('Done scraping ' + URL)
        return tags
    }
}
