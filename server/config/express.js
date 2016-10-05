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
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());
        app.use(methodOverride());
        app.use(passport.initialize());

        // Add headers
        app.use(function(req, res, next) {
            // Website you wish to allow to connect
            res.setHeader('Access-Control-Allow-Origin', '*');
            // Request methods you wish to allow
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            // Request headers you wish to allow
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
            // Set to true if you need the website to include cookies in the requests sent
            // to the API (e.g. in case you use sessions)
            res.setHeader('Access-Control-Allow-Credentials', true);
            // Pass to next layer of middleware
            next();
        });

        if (env !== 'test') {
            app.use(morgan('dev'));
        }

        app.use('/', express.static('apidoc'));
        app.set('appPath', path.join(config.root, 'apidoc'));

        /* istanbul ignore next */
        if (env === 'development' || env === 'test') {
            app.use(require('connect-livereload')());
        }
    };
})();
