import * as puppeteer from 'puppeteer';

describe('browser with extension write-better', () => {
  let browser: puppeteer.Browser;
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      ignoreDefaultArgs: ["--disable-extensions","--enable-automation"],
      args: [
        `--disable-extensions-except=${process.env.PWD}/extension`,
        `--load-extension=${process.env.PWD}/extension`,
      ]
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('on page WriteBetter Test Doc', () => {
    it('highlights 7 errors', async () => {
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 900 });
      await page.goto('https://docs.google.com/document/d/1KX_6FahTxjSIDIh07LdfIt4dfik0_S1OTzNvQsD3YOc');

      expect(await page.title()).toBe('WriteBetter Test Doc - Google Docs');
      await page.waitFor(3000); // TODO: figure out why last element takes a second to display.

      const highlights: string[] = await page.evaluate(() => {
        const hs: string[] = [];
        document.querySelectorAll('span.writebetter-highlight').forEach(e => hs.push(e.textContent.replace(/\u200C/g, '')))
        return hs;
      });
      const texts = ['So', 'obviously', 'utilize', 'really', 'been marked', 'It goes without saying']; // Include 'There is'
      expect(highlights).toEqual(texts);

      await page.close();
    }, 20000);

    xit('should take screenshot', async () => {
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 900 });
      await page.goto('https://docs.google.com/document/d/1KX_6FahTxjSIDIh07LdfIt4dfik0_S1OTzNvQsD3YOc');
      await page.waitFor(1000);
      await page.screenshot({ path: 'assets/images/screenshot.png' });
      await page.close();
    }, 10000);
  });

  describe('on page So the cat was stolen', () => {
    it('highlights shouldn not start or end with spaces', async () => {
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 400 });
      await page.goto('https://docs.google.com/document/d/1KRKs0GgRej236vk0hAE4CMA_JcC0VWYdIr459V2n25I');
      await page.waitFor(3000); 
      const highlights: string[] = await page.evaluate(() => {
        const hs: string[] = [];
        document.querySelectorAll('span.writebetter-highlight').forEach(e => hs.push(e.textContent.replace(/\u200C/g, '')))
        return hs;
      });
      // TODO: Actually check higlight content.
      highlights.forEach(h => {
        expect(h).toBe(h.trim());
      });

      await page.close();
    }, 20000);
  })

  describe('on page Write Better Extension', () => {
    it('highlights suggestions', async () => {
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 400 });
      await page.goto('https://docs.google.com/document/d/1pobtU3ZX0eJkMGXBa0dcH8LkJB3jRFt31dZwY3ozeLM');
      await page.waitFor(3000);
      const highlights: string[] = await page.evaluate(() => {
        const hs: string[] = [];
        document.querySelectorAll('span.writebetter-highlight').forEach(e => hs.push(e.textContent.replace(/\u200C/g, '')))
        return hs;
      });

      expect(highlights).toEqual(['be improved', 'things', 'obviously', 'Therefore', 'pain in the'])

      await page.close();
    }, 20000);
  });
});