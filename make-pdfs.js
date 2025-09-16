// make-pdfs.js
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const outDir = path.resolve(__dirname, 'pdfs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const urls = fs.readFileSync('urls.txt','utf8').split(/\r?\n/).filter(Boolean);

  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();

  for (let i=0;i<urls.length;i++) {
    const url = urls[i];
    try {
      console.log(`Loading ${url}`);
      await page.goto(url, {waitUntil: 'networkidle2', timeout: 60000}); // waits for network quiet
      // optional: wait for a selector: await page.waitForSelector('#main', {timeout:5000});
      const filename = `page_${String(i+1).padStart(4,'0')}.pdf`;
      const out = path.join(outDir, filename);
      await page.pdf({
        path: out,
        format: 'A4',
        printBackground: true,
        margin: {top: '10mm', bottom: '10mm', left: '8mm', right: '8mm'}
      });
      console.log(`Saved ${out}`);
    } catch (err) {
      console.error(`Failed ${url}: ${err.message}`);
    }
  }

  await browser.close();
})();

