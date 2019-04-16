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
  });

  describe('so the cat was stolen', () => {
    it('highlights shouldn not start or end with spaces', async () => {
      const page = await browser.newPage();
      await page.goto('https://docs.google.com/document/d/1KRKs0GgRej236vk0hAE4CMA_JcC0VWYdIr459V2n25I');

      const highlights: string[] = await page.evaluate(() => {
        const hs: string[] = [];
        document.querySelectorAll('span.writebetter-highlight').forEach(e => hs.push(e.textContent))
        return hs;
      });
      highlights.forEach(h => {
        expect(h).toBe(h.trim());
      });

      await page.close();
    });
  })
});