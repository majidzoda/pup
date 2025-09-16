// make-pdfs.js
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const outDir = path.resolve(__dirname, 'pdfs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const urls = fs.readFileSync('urls.txt','utf8').split(/\r?\n/).filter(Boolean);

  const browser = await puppeteer.launch({
  headless: false, // must be false to use real profile
  args: [
    `--user-data-dir=C:\\Users\\JohnDoe\\AppData\\Local\\Google\\Chrome\\User Data`,
    '--profile-directory=Default' // or 'Profile 1' etc.
  ],
});
  const page = await browser.newPage();

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      console.log(`Loading ${url}`);

      // navigate and wait until redirects & network quiet
      await page.goto(url, {
        waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
        timeout: 60000
      });

      // wait for stability after redirect
      await page.waitForTimeout(1500);

      // safer title fetch after redirects
      let title;
      try {
        title = await page.title();
      } catch {
        title = `page_${i+1}`;
      }
      const safeTitle = title.replace(/[\/\\?%*:|"<>]/g, '').slice(0,50);

      const filename = `${String(i+1).padStart(4,'0')}_${safeTitle}.pdf`;
      const out = path.join(outDir, filename);

      await page.pdf({
        path: out,
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', bottom: '10mm', left: '8mm', right: '8mm' }
      });

      console.log(`Saved ${out}`);
    } catch (err) {
      console.error(`Failed ${url}: ${err.message}`);
    }
  }

  await browser.close();
})();

