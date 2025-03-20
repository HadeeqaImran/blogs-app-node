const Page = require('./helpers/page');

let page;

// It only runs before each test IN THIS FILE So if I want to generate an authenticated user, doing so in this statement will get me to do that on every testing file
beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000/');
})

afterEach(async() => {
    await page.close();
});

test('Header has the correct text', async () => {
    const text = await page.getContentsOf('a.brand-logo'); 
    expect(text).toEqual('Blogster');
})

test('Clicking login starts oauth flow', async () => {
    await page.click('.right a');
    const url = await page.url(); // Go to puppeteer docs
    expect(url).toMatch(/accounts\.google\.com/); // Go to jest docs
})


// test.only is used to run only this test.
test('When signed in, shows logout button', async () => {
    await page.login();
    const text = await page.getContentsOf('a[href="/auth/logout"]');
    expect(text).toEqual('Logout');

}, 60000); // This is the timeout for the test. If the test does not complete in 10 seconds, it will fail.


// Function that starts running the tests. 
// Signature: test('description of the test', () => { ... });
// The second argument is a function that contains the test logic.
// The first argument is a description of the test.

// test ('We can launch a browser', async () => {
//     const browser = await puppeteer.launch({
//         executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
//         headless: false,
//     }); // Launches a browser instance
//     // Every interaction with the browser is done through an async function.
//     const page = await browser.newPage(); // Creates a new page in the browser
// })