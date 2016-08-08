(function IIFE() {
  'use strict';

  const router = require('express').Router();

  // Setup routes to controllers here
  router.use('/user', require('./user'));
  router.use('/podcast', require('./podcast'));
  router.use('/review', require('./review'));

  module.exports = router;
})();
