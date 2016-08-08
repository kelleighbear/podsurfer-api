(function IIFE() {
  'use strict';

  module.exports = {
    port: process.env.PORT || fatal('PORT not defined'),
    mongo: {
      uri: process.env.MONGODB_URI || fatal('MONGODB_URI not defined'),
      autoIndex: false
    }
  };

  function fatal(message) {
    throw new Error(message);
  }
})();
