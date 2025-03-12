require('../models/User'); // requiring this will prompt jest to run the User model file and create the User model
 
const mongoose = require('mongoose');
const keys = require('../config/keys'); // Require the mongo URI from the keys file
 
console.log('Connecting to mongo');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
 
afterAll(async () => {
  await mongoose.disconnect();
});