import * as puppeteer from 'puppeteer';

describe('browser with extension', () => {
  let browser: puppeteer.Browser;
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      args: [
        `--disable-extensions-except=/Users/justiceo/code/chrome/write-better/extension`,
        `--load-extension=/Users/justiceo/code/chrome/write-better/extension`,
      ]
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('smoke test', () => {
    it('puppeteer\'s example with extension', async () => {
      const page = await browser.newPage();
      await page.goto('https://developers.google.com/web/');

      // Type into search box.
      await page.type('#searchbox input', 'Headless Chrome');

      // Wait for suggest overlay to appear and click "show all results".
      const allResultsSelector = '.devsite-suggest-all-results';
      // await page.waitForSelector(allResultsSelector)
      expectAsync(page.waitForSelector(allResultsSelector)).toBeResolved();
      await page.click(allResultsSelector);

      // Wait for the results page to load and display the results.
      const resultsSelector = '.gsc-results .gsc-thumbnail-inside a.gs-title';
      await page.waitForSelector(resultsSelector);

      // Extract the results from the page.
      const links = await page.evaluate(resultsSelector => {
        const anchors = Array.from(document.querySelectorAll(resultsSelector));
        return anchors.map(anchor => {
          const title = anchor.textContent.split('|')[0].trim();
          return `${title} - ${anchor.href}`;
        });
      }, resultsSelector);
      console.log(links.join('\n'));

      await page.close();
    });
  });


  describe('writebetter test doc', () => {
    it('should have writebetter test doc in title', async () => {
      const page = await browser.newPage();
      await page.goto('https://docs.google.com/document/d/1KX_6FahTxjSIDIh07LdfIt4dfik0_S1OTzNvQsD3YOc');

      expect(await page.title()).toBe('WriteBetter Test Doc - Google Docs');
      await page.close();
    });

    it('writebetter-highlights', async () => {
      const page = await browser.newPage();
      await page.goto('https://docs.google.com/document/d/1KX_6FahTxjSIDIh07LdfIt4dfik0_S1OTzNvQsD3YOc');

      await page.waitFor(1000);

      let count = await page.evaluate(() => {
        return document.querySelectorAll('span.writebetter-highlight').length
      });

      expect(count).toBe(6);

      await page.close();
    }, 10000);
  });
});

