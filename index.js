const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const keys = require('./config/keys');

require('./services/cache');
require('./models/User');
require('./models/Blog');
require('./services/passport');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useMongoClient: true });

const app = express();

app.use(bodyParser.json());
app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey]
  })
);
app.use(passport.initialize());
app.use(passport.session());

require('./routes/authRoutes')(app);
require('./routes/blogRoutes')(app);
require('./routes/uploadRoutes')(app); // The first require statement returns the arrow function inside the uploadRoutes, the second one is for invoking the function.

const { NODE_ENV } = process.env;
if (NODE_ENV in ['ci', 'production']) {
  // All the client side application files after npm run build are placed in this directory
  app.use(express.static('client/build')); 

  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve('client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening on port`, PORT);
});

// In dev env, we have a react server running that serves the client side code,
// but for prod and ci we need to create builds that run on the virtual machine or server
// Therefore, in these cases we need to add to serve the build from client/build directory