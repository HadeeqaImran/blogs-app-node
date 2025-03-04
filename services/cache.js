const mongoose = require("mongoose");
const redis = require('redis');
const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
const util = require('util');

// promisify: takes a function that takes a callback and returns a promise
client.get = util.promisify(client.get);

//     // Do we have any cached data in redis related to this query
//     const cachedBlogs = await client.get(req.user.id);
//     // If yes, then respond to the request right away and return
//     if (cachedBlogs) {
//       console.log('SERVING FROM CACHE');
//       return res.send(JSON.parse(cachedBlogs));
//     }
//     // If no, we need to respond to request and update our cache to store the data
//     console.log('SERVING FROM MONGODB');
// // This holds a reference to the original exec function.
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function() {
    // We use a function keyword here and not the arrow function because we need to access the this keyword.
    const key = JSON.stringify(Object.assign({}, this.getQuery(), { collection: this.mongooseCollection.name }));

    const cachedValue = await client.get(key);

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

    client.set(key, JSON.stringify(result));
    return result;
}