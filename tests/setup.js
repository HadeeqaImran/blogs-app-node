const mongoose = require('mongoose');
const keys = require('../config/keys');

mongoose.Promise = global.Promise;

beforeAll(async () => {
  console.log('Connecting to MongoDB...');
  
  await mongoose.connect(keys.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('✅ Connected to MongoDB');
});

afterAll(async () => {
  await mongoose.disconnect();
});