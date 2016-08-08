'use strict';

const crypto = require('crypto');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = require('mongoose').Schema;
const _ = require('lodash');

var PodcastSchema = new Schema({
    name: String,
    link: String,
    release: Date,
    producer: String,
    cast: [{
        actor: String,
        character: String
    }],
    length: Number,
    description: String,
    episodes: [{
        name: String,
        link: String,
        description: String,
        imageUrl: String
    }],
    tags: [String],
    imageURL: String
});

// Validate email is not taken
PodcastSchema
    .path('name')
    .validate(function(value, respond) {
        var self = this;
        return this.constructor.findOne({
                name: value
            }).exec()
            .then(function(podcast) {
                if (podcast) {
                    if (self.id === podcast.id) {
                        return respond(true);
                    }
                    return respond(false);
                }
                return respond(true);
            })
            .catch(function(err) {
                throw err;
            });
    }, 'A podcast with this name already exists.');

module.exports = mongoose.model('Podcast', PodcastSchema);
