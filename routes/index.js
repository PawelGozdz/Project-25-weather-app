const express = require('express');
const router = express.Router();
const { check, body } = require('express-validator/check');
const weatherController = require('../controllers/weatherController');
const User = require('../models/User');
const isAuth = require('../middlewear/is-auth');

const authController = require('../controllers/authController');

const { catchErrors } = require('../handlers/errorHandlers');

// routes
router.get('/', catchErrors(weatherController.getIndex));

router.get('/register', authController.getRegister);
router.post('/register', [
  body('email', 'Please enter valid email')
    .isEmail()
    .custom((value, { req }) => {
      return User.findOne({ email: value })
        .then(userDoc => {
          if (userDoc) {
            return Promise.reject('Email exists already, pick another one.');
          }
        });
    })
    .normalizeEmail(),
  body('name', 'Youor name must be at least 3 char long.')
    .isLength({ min: 3 })
    .trim(),
  body('password', 'Please enter a password with at least 5 characters [0-1] [a-z] or [A-Z]')
    .isLength({ min: 5 })
    .trim(),
  body('password-confirm')
    .trim()
    .custom((value, { req }) => {
      if (value.toString() !== req.body.password.toString()) {
        throw new Error('Passwords don\'t match!');
      }
      return true;
    })
  ], catchErrors(authController.postRegister)
);

router.get('/login', authController.getLogin);
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password', 'Password has to be valid.')
    .isAlphanumeric()
    .trim()
], catchErrors(authController.postLogin));

router.get('/logout', authController.postLogout);

router.get('/account', isAuth, authController.getAccount);

router.post('/account/delete', [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password', 'Password has to be valid.')
    .isAlphanumeric()
    .trim()
], isAuth, catchErrors(authController.postDeleteUser));


/**
 * API routes
 */

router.get('/api/place', catchErrors(weatherController.searchPlace));
router.get('/api/places', catchErrors(weatherController.getAllUserPlaces));
router.post('/api/place/favorite', catchErrors(weatherController.fetchOrDeletePlaces));

module.exports = router;
