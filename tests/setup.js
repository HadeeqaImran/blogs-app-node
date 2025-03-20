const mongoose = require('mongoose');
const keys = require('../config/keys');

jest.setTimeout(60000);

mongoose.Promise = global.Promise;

beforeAll(async () => {
  await mongoose.connect(keys.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});