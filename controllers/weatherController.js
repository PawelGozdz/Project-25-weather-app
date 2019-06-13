const mongoose = require('mongoose');
const Place = mongoose.model('Place');
const axios = require('axios');

const DISPLAY_RECORDS = 4;

async function fetchWeather(lat, lng) {
  const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${+lat}&lon=${+lng}&APPID=${process.env.WEATHER_API}`);
  return data;
}

exports.getIndex = async (req, res, next) => {
  res.render('index', { 
    title: 'Weather anywhere in the world!',
    pagePath: '/'
  });
};


exports.searchPlace = async (req, res, next) => {
  if (!req.query.lat || !req.query.lng) {
    res.json({});
    return;
  }
  const data = await fetchWeather(req.query.lat, req.query.lng);
  res.json(data || {});
};

exports.getAllUserPlaces = async (req, res, next) => {
  if (!req.session.user) {
    res.json({ alert: 'You must be logged in to see your favorite places.' });
    return;
  }
  const favoritePlaces = await Place.find({ author: req.session.user._id }).sort({ created: - 1 }).limit(DISPLAY_RECORDS);

  res.json(favoritePlaces);
};

exports.fetchOrDeletePlaces = async (req, res, next) => {
  if (!req.body) {
    res.json({ alert: 'No data received' });
    return;
  };
  if (!req.session.user) {
    res.json({ alert: 'You must be logged in!' });
    return;
  }

  const { name, lat, lng, icon, website } = req.body;

  // Query DB to check if this place is already favorite
  const searchedPlace = await Place.find({ 
    location: {
      type: 'Point',
      coordinates: [
        lng, lat
      ]
    },
    author: req.session.user._id,
    name
  });

  // if no, create it and return 4 newest likes
  if (searchedPlace.length === 0) {
    const place = new Place({
      name,
      author: req.session.user._id,
      location: {
        coordinates: [lng, lat]
      },
      icon,
      favorite: true,
      website
    });
    
    await place.save();
    const userPlaces = await Place.find({ author: req.session.user._id }).sort({ created: - 1 }).limit(DISPLAY_RECORDS);
    res.json(userPlaces);
    return;
  }

  // if yes, toggle it (remove it) and return 4 newest likes
  await Place.findByIdAndDelete(searchedPlace);
  const places = await Place.find({ author: req.session.user._id }).sort({ date: -1 }).limit(DISPLAY_RECORDS);


  res.json(places);
};
