const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    // pierwsze jak ma być validowane, a drugie error msg
    validate: [validator.isEmail, 'Invalid Email Address'],
    required: 'Please Supply an email address' 
  },
  name: {
    type: String,
    required: 'Please supply a name',
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiration: Date,
});

// It returns prettier error then ugly standard one
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);
