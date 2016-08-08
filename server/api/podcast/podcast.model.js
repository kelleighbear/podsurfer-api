'use strict';

const crypto = require('crypto');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = require('mongoose').Schema;
const _ = require('lodash');

var PodcastSchema = new Schema({
  name: String
});

module.exports = mongoose.model('Podcast', PodcastSchema);
