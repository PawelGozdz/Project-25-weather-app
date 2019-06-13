const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

// This is our JavaScript rule that specifies what to do with .js files
const javascript = {
  test: /\.(js)$/, // anything that ends in `.js`
  use: [{
    loader: 'babel-loader',
    options: { presets: ['env'] } // env it a recommended setting
  }],
};

// postCSS gets fed into the next loader

const postcss = {
  loader: 'postcss-loader',
  options: {
    plugins() { return [autoprefixer({ browsers: 'last 3 versions' })]; }
  }
};

// this is our sass/css loader
const styles = {
  test: /\.(scss)$/,
  use: ExtractTextPlugin.extract(['css-loader?sourceMap', postcss, 'sass-loader?sourceMap'])
};

// Compress our JS
const uglify = new webpack.optimize.UglifyJsPlugin({ // eslint-disable-line
  compress: { warnings: false }
});

// Putting all together
const config = {
  entry: {
    App: ['babel-polyfill', './public/js/weather-app.js']
  },
  // we're using sourcemaps and here is where we specify which kind of sourcemap to use
  devtool: 'source-map',
  // Once things are done, we kick it out to a file.
  output: {
    path: path.resolve(__dirname, 'public', 'dist'),
    filename: '[name].bundle.js'
  },

  // passing modules
  module: {
    rules: [javascript, styles]
  },
  // plugins: [uglify]
  plugins: [
    // output our css to a separate file
    new ExtractTextPlugin('style.css'),
  ]
};

process.noDeprecation = true;

module.exports = config;
