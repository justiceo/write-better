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

  describe('writebetter test doc', () => {
    it('writebetter-highlights', async () => {
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 900 });
      await page.goto('https://docs.google.com/document/d/1KX_6FahTxjSIDIh07LdfIt4dfik0_S1OTzNvQsD3YOc');

      expect(await page.title()).toBe('WriteBetter Test Doc - Google Docs');
      await page.waitFor(3000); // TODO: figure out why last element takes a second to display.

      const highlights: string[] = await page.evaluate(() => {
        const hs: string[] = [];
        document.querySelectorAll('span.writebetter-highlight').forEach(e => hs.push(e.textContent))
        return hs;
      });
      const texts = ['So', 'There is', 'obviously', 'utilize', 'really', 'been marked', 'It goes without saying'];
      expect(highlights).toEqual(texts);

      await page.close();
    }, 10000);

    xit('should take screenshot', async () => {
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 900 });
      await page.goto('https://docs.google.com/document/d/1KX_6FahTxjSIDIh07LdfIt4dfik0_S1OTzNvQsD3YOc');
      await page.waitFor(1000);
      await page.screenshot({ path: 'assets/images/screenshot.png' });
      await page.close();
    }, 10000);
  });

  describe('so the cat was stolen', () => {
    it('highlights shouldn not start or end with spaces', async () => {
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 400 });
      await page.goto('https://docs.google.com/document/d/1KRKs0GgRej236vk0hAE4CMA_JcC0VWYdIr459V2n25I');

      const highlights: string[] = await page.evaluate(() => {
        const hs: string[] = [];
        document.querySelectorAll('span.writebetter-highlight').forEach(e => hs.push(e.textContent))
        return hs;
      });
      highlights.forEach(h => {
        expect(h).toBe(h.trim());
      });

      // Increase the viewport hieight to simulate a scroll event that exposes more content at bottom. 
      // Actually event fired is a resize event but that works too.
      await page.setViewport({ width: 1200, height: 1900 });
      await page.waitFor(2000);

      const moreHiglights: string[] = await page.evaluate(() => {
        const hs: string[] = [];
        document.querySelectorAll('span.writebetter-highlight').forEach(e => hs.push(e.textContent))
        return hs;
      });
      expect(moreHiglights.length).toBeGreaterThan(highlights.length);
      moreHiglights.forEach(h => {
        expect(h).toBe(h.trim());
      });

      await page.close();
    });
  })
});