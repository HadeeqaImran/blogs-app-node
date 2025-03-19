const { clearHash } = require('../services/cache');

// Middlewares are supposed to run before the route handlers. But here we only want to dump the cache if the post is created successfully.
module.exports = async (req, res, next) => {
    await next(); // This waits for the route handler to complete first and then comes back to executing lines after this one
    clearHash(req.user.id);
}


/*
Step-by-Step Execution Flow
 - Middleware is called before the route handler.
 - await next(); is executed
 - next() tells Express to pass control to the next middleware or the actual route handler.
The await keyword ensures that it waits for the next function (i.e., the request handler) to complete before moving to the next line.
After the request handler finishes execution, clearHash(req.user.id); is called to remove cached data for the user.
*/