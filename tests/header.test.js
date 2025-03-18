// Because if will test the elements inside my header
const sessionFactory = require('./factories/session');
const userFactory = require('./factories/user');
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
    const text = await page.$eval('a.brand-logo', element => element.innerHTML); // This is not being executed inside the jest suite. It is a separate process.
    // Puppeteer serializes our arrow function to string and it is sent to chromium instance from where it is converted to a function and executed, the result it afterwards sent back.
    // $eval is a normal variable.
    expect(text).toEqual('Blogster');
})

test('Clicking login starts oauth flow', async () => {
    await page.click('.right a');
    const url = await page.url(); // Go to puppeteer docs
    expect(url).toMatch(/accounts\.google\.com/); // Go to jest docs
})


// test.only is used to run only this test.
test('When signed in, shows logout button', async () => {

    const user = await userFactory();
    console.log("user", user)
    const { session, sig } = sessionFactory(user);
    console.log("type", typeof(session), session)
    await page.setCookie({
        name: 'session',
        value: String(session),
        url: 'http://localhost:3000' // Ensure it's properly associated
    });
    await page.setCookie({
        name: 'session.sig',
        value: String(sig),
        url: 'http://localhost:3000'
    });
    await page.goto('http://localhost:3000');
    await page.waitForSelector('a[href="/auth/logout"]');

    const text = await page.$eval('a[href="/auth/logout"]', element => element.innerHTML);
    expect(text).toEqual('Logout');
}, 20000); // This is the timeout for the test. If the test does not complete in 10 seconds, it will fail.

// Next we need to find a way to log in, because any of the other tests need a logged in user.


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