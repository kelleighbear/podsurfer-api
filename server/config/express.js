(function IIFE() {
  'use strict';

  const methodOverride = require('method-override');
  const compression = require('compression');
  const bodyParser = require('body-parser');
  const express = require('express');
  const path = require('path');
  const morgan = require('morgan');
  const passport = require('passport');

  const config = require('./environment');

  module.exports = function(app) {
    app.disable('x-powered-by');

    let env = app.get('env');

    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    app.use(compression());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(passport.initialize());

    if(env !== 'test') {
      app.use(morgan('dev'));
    }

    app.use('/', express.static('apidoc'));
    app.set('appPath', path.join(config.root, 'apidoc'));

    /* istanbul ignore next */
    if(env === 'development' || env === 'test') {
      app.use(require('connect-livereload')());
    }
  };
})();
