const fs = require('fs');
const path = require('path');
const got = require('got');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const inputFile = path.join(__dirname, '..', 'input_sites', 'sites.txt');
const outputDir = path.join(__dirname, '..', 'output');

async function run() {
  const sites = fs.readFileSync(inputFile, 'utf-8')
    .split(/\r?\n/)
    .filter(Boolean);
  fs.mkdirSync(outputDir, { recursive: true });
  for (const site of sites) {
    console.log(`Auditing ${site}`);
    try {
      const url = site.startsWith('http') ? site : `https://${site}`;
      const response = await got(url);
      const $ = cheerio.load(response.body);
      const report = {
        url,
        statusCode: response.statusCode,
        title: $('title').text() || null,
        scriptCount: $('script').length,
      };

      // Use Puppeteer to collect cookies and local storage information
      const browser = await puppeteer.launch({headless: 'new'});
      const page = await browser.newPage();
      await page.goto(url, {waitUntil: 'domcontentloaded'});
      const cookies = await page.cookies();
      const localStorageData = await page.evaluate(() => {
        const entries = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          entries[key] = localStorage.getItem(key);
        }
        return entries;
      });
      await browser.close();

      report.cookies = cookies;
      report.localStorage = localStorageData;
      const fileName = url.replace(/[^a-zA-Z0-9.-]/g, '_') + '.json';
      fs.writeFileSync(path.join(outputDir, fileName), JSON.stringify(report, null, 2));
    } catch (err) {
      console.error(`Failed to audit ${site}: ${err.message}`);
    }
  }
}

run();
