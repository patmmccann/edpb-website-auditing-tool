const fs = require('fs');
const path = require('path');
const got = require('got');

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
      const response = await got(`https://${site}`);
      const fileName = site.replace(/[^a-zA-Z0-9.-]/g, '_') + '.html';
      fs.writeFileSync(path.join(outputDir, fileName), response.body);
    } catch (err) {
      console.error(`Failed to audit ${site}: ${err.message}`);
    }
  }
}

run();
