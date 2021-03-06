/*
  Catch Errors Handler

  Instead of using try{} catch(e) {} in each controller, we wrap the function in catchErrors() for async/await functions, catch any errors they throw, and pass it along to our express middleware with next()
*/

exports.catchErrors = (fn) => {
  return function(req, res, next) {
    return fn(req, res, next).catch(next);
  };
};

/**
 * Not Found Error Handler
 * If we hit a route that is not found, we add status 404 and pass it to the next error handler to display
 */

exports.notFound = (req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
};

/**
 * Monto DB Validation Error Handler
 * If error occurs, display via flash messages
 */

exports.flashValidationErrors = (err, req, res, next) => {
  // if there are no error to show for flashes, skip it
  if (!err.errors) return next(err);
  // validation errors look like
  const errorKeys = Object.keys(err.errors);
  console.log('-------------------', errorKeys);
  errorKeys.forEach(key => req.flash('error', err.errors[key].message));
  res.redirect('back');
};

/**
 * Development Error Handler
 * 
 * In dev mode, if we hit a syntax error or any other previously unhandled error, we can show info on what happened
 */

exports.developmentErrors = (err, req, res, next) => {
  err.stack = err.stack || '';
  const errorDetails = {
    message: err.message,
    status: err.status,
    stackHighlighted: err.stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>')
  };
  res.status(err.status || 500);
  res.format({
    // Based on the `Accept` http header
    'text/html': () => {
      res.render('error', errorDetails);
    }, // Form Submit, Reload the page
    'application/json': () => res.json(errorDetails) // Ajax call, send JSON back
  });
};

/**
 * Production Error Handler
 * 
 * No error info show to user
 */

exports.productionErrors = (err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
};
