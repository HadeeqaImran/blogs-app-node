const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = () => {
    console.log('User to mongo');
    return new User({}).save();
}

// When we run jest it looks for only the test.js files in the project and runs them separate from the server code. 
// Therefore the connection that was created with the database in the server code is not available in the test environment.
// Same goes for the models that were created in the server code.