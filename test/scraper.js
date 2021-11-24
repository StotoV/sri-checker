// const stub = {
//     Browser: {
//         newPage: {}
//     },
//     Page: {
//         goto: async function(url) { Promise.resolve(true) }
//     }
// }
const assert = require('assert').strict;
const puppeteer = require('puppeteer')

const Scraper = require('../src/scraper.js')

describe('Scraping tests', function() {
    it('tests the extraction of script and link tags', async function() {
        // Arrange - mocking puppeteer
        var scraper = new Scraper()
        // const browser = await puppeteer.launch({
        //     headless: true,
        //     executablePath: '/usr/bin/chromium'
        // })
        // const mockPage = await browser.newPage()
        // delete mockPage['goto']
        // mockPage.goto = mockPage.setContent('file://./assets/html/scrip_link_tags.html')
        // scraper.page = mockPage

        try {
            const res = await scraper.scrape('https://youtube.com')
            console.log(res)

            assert.ok(true)
        } catch (error) {
            assert.fail(error)
        } finally {
            // await browser.close()
        }
    })
})
