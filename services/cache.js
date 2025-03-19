const mongoose = require("mongoose");
const redis = require('redis');
const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
const util = require('util');

// Every query in our system inherits from Query.prototype so we can tie a function cache to it to selectively cache queries and have good code readability.
mongoose.Query.prototype.cache = function(options={}) {
    // These are made up names so you can use any name you want.

    this.useCache = true; // We have assigned this property to the query instance. So only those queries which have this function will have the useCache flag set to true (it is an instance)
    // Specify a top level id. Need to stringify it because it is an object - has to be stored in redis.
    this.hashKey = JSON.stringify(options?.key || ''); // If the key is not provided, it will be an empty string.
    return this; // To make it a chainable function
}

// promisify: takes a function that takes a callback and returns a promise
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function() {
    if(!this.useCache) {
        return exec.apply(this, arguments);
    }
    // We use a function keyword here and not the arrow function because we need to access the this keyword.
    const key = JSON.stringify(Object.assign({}, this.getQuery(), { collection: this.mongooseCollection.name }));

    const cachedValue = await client.hget(this.hashKey, key);

    if (cachedValue) {

        // If we do this we are not returning a mongoose document instance. We are returning a plain JSON object.
        // return JSON.parse(cachedValue);
        // If we log "this", we can see that the value has a model property which is a reference to the model that created the query.
        // It is like doing new Blog({ title: 'hi', content: 'there' });

        // new this.model(JSON.parse(cachedValue)); // this expects to get only one instance of a document. That is why it will log the user in perfectly but while fetching multiple blogs will not work.
       
        const doc = JSON.parse(cachedValue);

        return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc);
    }
    
    const result = await exec.apply(this, arguments);
    // Result is a document instance. To store it in redis we need o convert it into JSON and strigify it.

    // Since I added the cache expiration to it afterwards, it is not going to work until the cache is reset.
    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);
    return result;
}


// We can now import this function and then use it to blow away data for a particular hash instance.
module.exports = {
    clearHash(hashKey) {
      client.del(JSON.stringify(hashKey));
    }
}


// --------------------- Not so good approach ---------------------
/* Because we have changed the exec function and every query that goes to the db passes through it. We might not want to cache every query that comes in because redis is not a cheap storage space */

// // promisify: takes a function that takes a callback and returns a promise
// client.get = util.promisify(client.get);
// const exec = mongoose.Query.prototype.exec;

// mongoose.Query.prototype.exec = async function() {
//     // We use a function keyword here and not the arrow function because we need to access the this keyword.
//     const key = JSON.stringify(Object.assign({}, this.getQuery(), { collection: this.mongooseCollection.name }));

//     const cachedValue = await client.get(key);

//     if (cachedValue) {

//         // If we do this we are not returning a mongoose document instance. We are returning a plain JSON object.
//         // return JSON.parse(cachedValue);
//         // If we log "this", we can see that the value has a model property which is a reference to the model that created the query.
//         // It is like doing new Blog({ title: 'hi', content: 'there' });

//         // new this.model(JSON.parse(cachedValue)); // this expects to get only one instance of a document. That is why it will log the user in perfectly but while fetching multiple blogs will not work.
       
//         const doc = JSON.parse(cachedValue);

//         return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc);
//     }
    
//     const result = await exec.apply(this, arguments);
//     // Result is a document instance. To store it in redis we need o convert it into JSON and strigify it.

//     client.set(key, JSON.stringify(result));
//     return result;
// }

