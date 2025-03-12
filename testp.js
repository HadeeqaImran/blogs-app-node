const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    console.log("Puppeteer launched successfully!");
    await browser.close();
})();