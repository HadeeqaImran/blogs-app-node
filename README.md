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
