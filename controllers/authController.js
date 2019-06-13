const mongoose = require('mongoose');
const User = mongoose.model('User');
const Place = mongoose.model('Place');

const bcrypt = require('bcryptjs');

const { validationResult } = require('express-validator/check');

exports.getRegister = (req, res, next) => {
  res.render('register', {
    title: 'Register',
    pagePath: '/register',
    oldInput: { 
      email: "",
      password: "",
      confirmPassword: ""
    },
    validationErrors: []
  });
};

exports.postRegister = async (req, res, next) => {
  const { email } = req.body;
  const { name } = req.body;
  const { password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('register', {
      path: '/register',
      pageTitle: 'Register',
      oldInput: { 
        email,
        name,
        password,
        confirmPassword: req.body['password-confirm']
      },
      validationErrors: errors.array()
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = new User({
    email,
    name,
    password: hashedPassword
  });
  user.save();
  res.status(200).redirect('/login');
};

exports.getLogin = (req, res, next) => {

  res.render('login', {
    pagePath: '/login',
    pageTitle: 'Login',
    oldInput: {
      email: "",
      password: ""
    },
    validationErrors: []
  });
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('login', {
      path: 'login',
      pageTitle: 'Login',
      oldInput: {
        email,
        password
      },
      validationErrors: errors.array()
    });
  }

  const user = await User.findOne({ email  });

  if (!user) {
    return res.status(422).render('login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: 'Invalid email or password',
      oldInput: {
        email,
        password
      },
      validationErrors: []
    });
  }

  const matchPassword = await bcrypt.compare(password, user.password);

  if (matchPassword) {
    req.session.isLoggedIn = true;
    req.session.user = user;
    return req.session.save(err => {
      res.status(200).redirect('/');
    });
  }

  return res.status(422).render('login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: 'Invalid email or password',
    oldInput: {
      email,
      password
    },
    validationErrors: []
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => res.redirect('/'));
};

exports.getAccount = (req, res, next) => {
  res.render('account', {
    pagePath: '/account',
    pageTitle: 'Acount',
    oldInput: {
      email: "",
      password: ""
    },
    validationErrors: []
  });
};

exports.postDeleteUser = async (req, res, next) => {
  if (!req.session.user) throw new Error('User doesn\' exist!');

  const { email, password, userId } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('account', {
      path: '/account',
      pageTitle: 'Acount',
      oldInput: { 
        email,
        password
      },
      validationErrors: errors.array()
    });
  }
  
  const user = await User.findById({ _id: userId  });
  if (userId === req.session.user._id && req.session.user.email === email) {
    const favoritePlaces = await Place.deleteMany({ author: req.session.user._id  }, (err, data) => {
      if(err) throw new Error('These records cannot be deleted');
    });
    user.remove();
    return req.session.destroy(err => {
      res.status(200).redirect('/');
    });
  }

  res.status(422).render('account', {
    path: '/account',
    pageTitle: 'Acount',
    errorMessage: 'Make sure that you confirm your details',
    oldInput: { 
      email,
      password
    },
    validationErrors: errors.array()
  });
};
