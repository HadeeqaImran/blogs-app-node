# AdvancedNodeStarter

Starting project for a course on Advanced Node @ Udemy

### Setup

- Run `npm install` in the root of the project to install server dependencies
- Change into the client directory and run `npm install --legacy-peer-deps`
- Change back into the root of the project and run `npm run dev` to start the server
- Access the application at `localhost:3000` in your browser

**Important:**
The credentials for the Mongo Atlas DB in `dev.js` are read only. If you attempt to log in without first adding your own connection string (covered later in the course) you will see an error: `[0] MongoError: user is not allowed to do action [insert] on [advnode.users]`

# Caching
Caching is only for read operations, it has nothing to do with writes
Redis is an in memory data store e.g. if you run an instance on your local machine it will only persist the data until your machine is running.
Very fast for reading data.

client.set(key, value)
client.get(key, callback)
There can be nested hashes, such that there is a key -> (points to a full object of nested key calue pairs) nested key -> nested value
    hset(key, nested-key, value - the actual value that we want to store)
    hget(key, nested-key, callback)

In redis you  can only store numbers and strings, no js objects allowed so the following scenario occurs

![alt text](<Screenshot 2025-03-03 at 2.11.50 PM.png>)

Using redis for caching db query results
Key(query) -> Value(result of query)
query keys should be consistent but unique between executions. e.g if two users retrieve a list of their blog posts then they will be running the same query bit their results should be different that is, both results need to have separate instances in the redis cache.

Yes I trust the author


# Testing
1. npm run test, starts a jest suite for testing.
2. We will boot up a "headless" version on Chromium. In simple terms start a browser in our application
3. We will have ro instruct chromium to visit localhost:3000/
4. We will instruct chromium to click elements on the screen.
5. Make assertions about content on screen.

### Chromium
Chromium is an open source browser that google uses (open source condebas used) for chrome.
`Headless Browser` - A browser that runs without a user interface.

### Challenges
1. Some way to interact with chromium using code
2. Figure out what is being rendered on screen and make assertions about it in jest.
3. How do we simulate logging in as a user when we are using Google OAuth

### PS: Puppeteer is what runs the chromium browser for us.
Using this we can instantiate a new browser windiow. This object has a function tied to which can give us a browser tab (referred to as a page).

.test.js extension - becasue jest is going to look for files with this extension to consider them as having test cases.

### The testing process
Launch Chrome -> Navigate to app -> click something on screen -> use a dom selector to retireve the content of an element ->
Write assertions to make sure the content is correct

### Bypassing OAuth Flow
We cannont write code to automate google account selection to log in because when a lot of tests are run, google locks us out with a captcha

#### Make a secret route on the server which logs in our application
It is security risk

#### When tests are running, disable authentication requirement
Server and our test suite are two different processes so we cannot easily change the server code when tests rae running


# Continuous Integration
Process to merge all changes to a single branch
#### CI Server
A server that runs automated tests (can be automated tests like our project, linting or unit tests) on the codebase to ensure the changes haven't broken anything and are okay to merge.

# What is YAML File
Simplified way of writing plain json data. writing key value pairs as strings

# Changed to see if a build is triggered? 

# Image Upload
Where we store those images?
How can we access those stored images?
How can we map an image with a blog post?

# For interview might want to check other possible solutions and then their problems

# Solution 1: MongoDB
Why do we not store it in MongoDb?
It is very easy to store an image in MongoDb and the mapping to blog posts is easy too. BUT it is an expensive solution because you have to pay for storage on mongodb cloud

# Solution 2: Hardrive tied to a server.
Whenever we deploy our application to cloud (AWS, Heroku, Digital Ocean), we get a hard drive associated to it. We can place images in that hard drive. (Vast majority of sources advocate for this) BUT
one express server gets one hard drive associated with it. The problem starts to arise when we have multiple servers such as when we start to add load balancing to our server - there are multiple instances of the same server with each having a seprarte hard drive. If our image is in instance A and the request of the intended user goes to instance B then that user cannot access that image anymore.

# Solution 3: Outside Data Store
We can make express app upload our image to Amazon S3, Azure File Storage or Google Cloud Storage (mage for muli media storage).
Cheap storage resources.

## Rules for uploading images
1. You have to be logged in
2. You have to add validation at react and api level (do it for both)
3. The uploaded image needs to be tied to a blog post
4. Allow only image type file.

# Approach: 
A 2 hop approach with first the file being streamed to the hard drive with our express server and then from hard drive to S3.
Not the best approach and has some issues associated with it: Our express Api is involved in the upload, our server will have to allocate some resources to the upload processs. It makes handling uploads easier but the approach isn't as scalable becasue a lot of resources are being consumed and they are money instensive.
## A more scalable version which does not invlove the server in image upload process
![alt text](<Screenshot 2025-03-21 at 1.04.17 pm.png>)

## How is uploading images to S3 secure?

## Bucket
A bucket is a unit of storage inside of S3. These can be thought of as hard drives or folders. These buckets limit access to themselves as tightly as they can. When we create a bucket, then we can limit its access to our API which has. We can stop anyone from accessing the bucket at all. But when we get a presigned url, then our server can access the bucket for just that particular exactly one file upload. 

# Creating the S3 bucket
1. Using Amazon's IAM (Identity Access Management) we are going to generate a set of credentials which can only be used with our S3 account and that too with only our bucket for the project (no other services privided by Amazon.)

