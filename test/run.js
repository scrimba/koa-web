const puppeteer = require('puppeteer');

var mapping = {
  startGroup: 'group',
  endGroup: 'groupEnd'
}

async function run() {
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  page.on('console', async msg => {
    const type = msg.type();
    const prop = mapping[type] || type;
    const jsonValues = msg.args().map(handle => handle.jsonValue());
    const args = await Promise.all(jsonValues);
    console[prop].apply(null, args);

    const m = args[0].match(/^(\d+) failures/);
    if (m) {
      const exitCode = (m[1] == '0') ? 0 : 1;
      process.exit(exitCode);
    }
  });
  await page.goto('file://' + __dirname + '/index.html');
}

run().catch(err => {
  console.error(err);
  if (err.stack) console.log(err.stack);
  process.exit(1);
})
