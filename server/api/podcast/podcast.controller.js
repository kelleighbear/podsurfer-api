'use strict';

const Podcast = require('./podcast.model');
const config = require('../../config/environment');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

module.exports = {
  getOne: getOne,
  getAll: getAll,
  create: create,
  update: update,
  destroy: destroy
};

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

/**
 * Get all the podcasts
 */
function getAll(req, res) {
  return Podcast.find({}).exec()
    .then(podcasts => {
      res.status(200).json(podcasts);
    });
}

/**
* Get one podcast
*/
function getOne(req, res) {
  return Podcast.findById({
    _id: req.body._id
  }).exec()
  .then(podcast => {
    res.status(200).json(podcast);
  });
}

/**
* Create new podcast
*/
function create(req, res) {
  if(!req.body.name || !req.body.description) {
    res.status(500).send('Podcast must have a name and description.');
  }
  var newPodcast = new Podcast(req.body);
  newPodcast.save()
    .then(function(podcast) {
      res.status(200).json(podcast);
    })
    .catch(validationError(res));
}

/**
* Update a podcast
*/
function update(req, res, next) {
  return Podcast.findById({
    _id: req.params.id
  }).exec()
    .then(podcast => {
      if (podcast !== null) {
        podcast = _.merge(podcast, req.body);
        return podcast.save({
            new: true
          })
          .then(response => res.status(200).json(response))
          .catch(err => next(err));
      } else {
        next('Podcast was null');
      }
    });
}

/**
* Permanently remove a podcast
*/
function destroy(req, res) {
  return Podcast.findByIdAndRemove(req.params.id).exec()
    .then(function() {
      res.status(204).end();
    })
    .catch(handleError(res));
}
