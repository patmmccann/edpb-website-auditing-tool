const fs = require('fs');
const path = require('path');
const got = require('got');
const cheerio = require('cheerio');

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
      const fileName = url.replace(/[^a-zA-Z0-9.-]/g, '_') + '.json';
      fs.writeFileSync(path.join(outputDir, fileName), JSON.stringify(report, null, 2));
    } catch (err) {
      console.error(`Failed to audit ${site}: ${err.message}`);
    }
  }
}

run();
