const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Wpisz nazwę sklepu.'
  },
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [
      {
        type: Number,
        required: 'You must supply coordinates!'
      }
    ]
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'Supply an author'
  }
});

placeSchema.index({
  name: 'text'
});

module.exports = placeSchema;
// module.exports = mongoose.model('Place', placeSchema);
