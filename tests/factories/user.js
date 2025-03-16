const mongoose = require('mongoose');
require('../../models/User');
const User = mongoose.model('User');

module.exports = () => {
    try {
        const user = new User({});
        user.save();
        return user;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
}

// When we run jest it looks for only the test.js files in the project and runs them separate from the server code. 
// Therefore the connection that was created with the database in the server code is not available in the test environment.
// Same goes for the models that were created in the server code.