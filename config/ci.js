module.exports = {
    googleClientID: '245982318824-r41o0sm7tv3u5dc8iicd4skc553283ia.apps.googleusercontent.com',
    googleClientSecret: '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',
    mongoURI: 'mongodb://127.0.0.1:27017//blogs_ci', 
    // This mongodb instance will be available locally on the VM, and blogs_ci is the name of the database. What this url string should be? It can be known from travis documentation or a lot of troubleshooting.
    cookieKey: '123123123',
    redisUrl: 'redis://127.0.0.1:6379',
};