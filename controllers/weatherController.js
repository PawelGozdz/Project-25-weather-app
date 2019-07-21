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
  // if (req.session.user) {
  //   const userPlaces = await User.findOne({ _id: req.session.user._id });
  //   // console.log(userPlaces);
  // }
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

  const data = await fetchWeather(req.query.lat, req.query.lng);
  res.json(data || {});
};

exports.getAllUserPlaces = async (req, res, next) => {
  if (!req.session.user) {
    res.json({ alert: 'You must be logged in to see your favorite places.' });
    return;
  }
  const favoritePlaces = await User.findOne({ _id: req.session.user._id })
    .select('favorites')
    .sort((a, b) => a.created < b.created)
    .filter((c, i) => {
      if (i < DISPLAY_RECORDS) {
        return c;
      }
    });

  console.log(favoritePlaces);

  res.json(favoritePlaces);
};

exports.postFavoritePlace = async (req, res, next) => {
  if (!req.body || !req.params) {
    res.json({ alert: 'No data received' });
    return;
  }
  if (!req.session.user) {
    res.json({ alert: 'You must be logged in!' });
    return;
  }

  const { lat, lng, icon, website } = req.body;
  const { name } = req.params;

  // Query DB for the user
  const user = await User.findOne({ email: req.session.user.email });
  // Coparing if a new favorite exists
  let favoriteIndex;
  const operator = user.favorites
    .map((el, i) => {
      if (el.name === name) favoriteIndex = i;
      return el.name;
    })
    .includes(name);
  // Add
  if (!operator) {
    user.favorites.push({
      name,
      author: req.session.user._id,
      location: {
        coordinates: [lng, lat]
      },
      icon,
      favorite: true,
      website
    });
  } else {
    // remove
    // zlokalizować place i zrobić place.remove(). .remove() na modelu zapisuje od razu w DB, ale już na subdokumencie NIE! Dalej trzeba zrobić User.save()
    await user.favorites[favoriteIndex].remove();
  }
  // User.save()
  await user.save();

  res.json({
    alert:
      favoriteIndex === undefined
        ? `${name} has been added to favorites`
        : `${name} has been removed from favorites`
  });
};
