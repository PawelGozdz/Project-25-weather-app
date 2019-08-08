const mongoose = require('mongoose');

// Make sure we are running node 7.6+
const [major, minor] = process.versions.node.split('.').map(parseFloat);

if (major < 7 || (major === 7 && minor <= 5)) {
  console.log(
    '🛑 🌮 🐶 💪 💩\nHey You! \n\t Please update your node to version 7.6 or higher!'
  );
  process.exit();
}

// import environmental variables from our variables.env file
require('dotenv').config({ path: 'variables.env' });

// Connect to our Database and handle any bad connections
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', err => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

// Import all of our models
require('./models/User');
require('./models/Place');

// Start our app!
const app = require('./app');
app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
