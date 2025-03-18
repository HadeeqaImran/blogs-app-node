const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/session');
const userFactory = require('../factories/user');

class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: true,
            // args: ['--no-sandbox']
        });
        const page = await browser.newPage();
        const customPage = new CustomPage(page);
        return new Proxy(customPage, {
            get: function (target, property) {
                return (
                    customPage[property] || 
                    (browser && property in browser ? browser[property].bind(browser) : undefined) ||
                    (page && property in page ? page[property].bind(page) : undefined)
                );
            }
        });
        
    }

    constructor(page) {
        this.page = page;
    }

    async login() {
        const user = await userFactory();
        const { session, sig } = sessionFactory(user);

        await this.page.setCookie({ name: 'session', value: session });
        await this.page.setCookie({ name: 'session.sig', value: sig });
        await this.page.goto('http://localhost:3000/blogs');
        await this.page.waitForSelector('a[href="/auth/logout"]');
    }

    async getContentsOf(selector) {
        return this.page.$eval(selector, elemennt => elemennt.innerHTML);// This is not being executed inside the jest suite. It is a separate process.
        // Puppeteer serializes our arrow function to string and it is sent to chromium instance from where it is converted to a function and executed, the result it afterwards sent back.
        // $eval is a normal variable.
    }

    get(path) {
        return this.page.evaluate(async (_path) => {
            const response = await fetch(_path, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return response.json();
            } else {
                return response.text();
            };
        }, path);
    }

    post(path, data) {
        return this.page.evaluate(async (_path, _data) => { // We are going to stringify this function to pass over to the chromium instance for execution.
            // After making it a string you cannot acccess the path variable being passed inside the post method (because there is no closure scope - exists only for functions)
            const response = await fetch(_path, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(_data)
            })
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return response.json();
            } else {
                return response.text();
            };
        }, path, data); // These path and data are the argumnets being passed to the function.
    }

    execRequests(actions) {
        return Promise.all(
            actions.map(({ method, path, data }) => {
                return this[method](path, data);
            })
        );
    }
}

module.exports = CustomPage;