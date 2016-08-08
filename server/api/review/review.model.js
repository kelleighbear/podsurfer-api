'use strict';

const crypto = require('crypto');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = require('mongoose').Schema;
const _ = require('lodash');

var ReviewSchema = new Schema({
  name: String,
  podcast: {
    type: Schema.Types.ObjectId,
    ref: 'Podcast'
  },
  episode: Number,
  rating: Number,
  review: String,
  spoilers: Boolean,
  reviewer: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
