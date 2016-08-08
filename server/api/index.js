(function IIFE() {
  'use strict';

  const router = require('express').Router();

  // Setup routes to controllers here
  router.use('/user', require('./user'));

  module.exports = router;
})();
