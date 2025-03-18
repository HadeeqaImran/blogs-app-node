const Page = require('./helpers/page');

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000/');
})

afterEach(async() => {
    await page.close();
});


describe('When logged in', () => {
    
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });

    test('can see blog create form', async () => {
        const label = await page.getContentsOf('form label'); // Get the first form label to make sure that we are on the intended form
        expect(label).toEqual('Blog Title');
    });

    describe('and using valid inputs', () => {

        beforeEach(async () => {
            await page.type('.title input', 'My Title');
            await page.type('.content input', 'My Content');
            await page.click('form button');
        })

        test('submitting takes user to review screen', async () => {
            const text = await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries');
        })

        test('submitting then saving adds blog to index page', async () => {
            await page.click('button.green');
            // When you send an ajax request involvoing the backend for example in this case waiting for the blog to be saved and then fetched to be rendered on the page, you need to wait and jest does not wait on it itself.
            await page.waitForSelector('.card'); // We are waiting for elements having this selector on the page.

            // We don't have to worry about searching our blog post in a list of posts because while running the tests we create new users and those users will only have this one blog post associated to them (being created from this test)
            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('p');

            expect(title).toEqual('My Title');
            expect(content).toEqual('My Content');
        })
    })

    describe('and using invalid inputs', () => {
        
        beforeEach(async () => {
            await page.click('form button');
        });

        test('the form shows an error', async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');

            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        })
    })
})

describe('When user is not logged in', () => {
    test('User cannot create blog posts', async () => {
        const result = await page.post('/api/blogs', { title: 'My Title', content: 'My Content' });
        expect(result).toEqual({"error": "You must log in!"})
    })

    test('User cannot get a list of posts', async () => {
        const result = await page.get('/api/blogs')
        expect(result).toEqual({"error": "You must log in!"})
    })
})