'use strict';

const Category = require('./category.model');
const config = require('../../config/environment');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

module.exports = {
  get: get
};

/**
 * Get all the podcasts
 */
function get(req, res) {
  return Podcast.find({}).exec()
    .then(podcasts => {
      res.status(200).json(podcasts);
    });
}
