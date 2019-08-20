const mongoose = require('mongoose');
// const Place = require('../models/Place');
const User = mongoose.model('User');
const axios = require('axios');

const DISPLAY_RECORDS = 4;

async function fetchWeather(lat, lng) {
  const { data } = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?lat=${+lat}&lon=${+lng}&APPID=${
      process.env.WEATHER_API
    }`
  );
  return data;
}

exports.getIndex = async (req, res, next) => {
  res.render('index', {
    title: 'Weather anywhere in the world!',
    pagePath: '/'
  });
};

exports.getSearchPlace = async (req, res, next) => {
  if (!req.query.lat || !req.query.lng) {
    res.json({});
    return;
  }

  const { lat, lng, name } = req.query;

  const data = await fetchWeather(lat, lng);
  if (!data) {
    res.status(404).json({ alert: "Can't load the place" });
    return;
  }
  // Weather API is that accurate as Google's, therefore somethimes returns no name in response
  data.name = name;
  res.status(200).json(data);
};

exports.getAllUserPlaces = async (req, res, next) => {
  if (!req.session.user) {
    res.json({ alert: 'You must be logged in to see your favourite places.' });
    return;
  }

  const userPlaces = await User.findOne({ _id: req.session.user._id });

  userPlaces.password = undefined;

  res.json(userPlaces);
};

exports.postFavouritePlace = async (req, res, next) => {
  if (!req.body || !req.params) {
    res.json({ alert: 'No data received' });
    return;
  }
  if (!req.session.user) {
    res.json({ alert: 'You must be logged in!' });
    return;
  }

  const { lat, lng } = req.body;
  const { name } = req.params;

  // Query DB for the user
  const user = await User.findOne({ email: req.session.user.email });
  // Coparing if a new favourite exists
  let favouriteIndex;
  const operator = user.favourites
    .map((el, i) => {
      if (el.name === name) favouriteIndex = i;
      return el.name;
    })
    .includes(name);
  // Add
  if (!operator) {
    user.favourites.push({
      name,
      author: req.session.user._id,
      location: {
        coordinates: [lng, lat]
      }
    });
  } else {
    // remove
    // zlokalizować place i zrobić place.remove(). .remove() na modelu zapisuje od razu w DB, ale już na subdokumencie NIE! Dalej trzeba zrobić User.save()
    await user.favourites[favouriteIndex].remove();
  }
  // User.save()
  await user.save();

  res.json({
    alert:
      favouriteIndex === undefined
        ? `${name} has been added to favourites`
        : `${name} has been removed from favourites`,
    favourites: user.favourites
  });
};
