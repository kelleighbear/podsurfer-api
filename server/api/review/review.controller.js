'use strict';

const Review = require('./review.model');
const config = require('../../config/environment');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

module.exports = {
  getMine: getMine,
  getForPodcast: getForPodcast,
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
 * Get all the reviews I've submitted
 */
function getMine(req, res) {
  return Review.find({
    reviewer: req.user._id
  }).exec()
    .then(reviews => {
      res.status(200).json(reviews);
    });
}

/**
* Get one podcast
*/
function getForPodcast(req, res) {
  return Review.find({
    podcast: req.params.id
  }).exec()
  .then(reviews => {
    res.status(200).json(reviews);
  });
}

/**
* Create new podcast
*/
function create(req, res) {
  var newReview = new Review(req.body);
  newReview.reviewer = req.user._id;
  newReview.save()
    .then(function(podcast) {
      res.status(200).json(podcast);
    })
    .catch(validationError(res));
}

/**
* Update a podcast
*/
function update(req, res, next) {
  return Review.findById({
    _id: req.params.id
  }).exec()
    .then(review => {
      if (review !== null) {
        if(review.reviewer.equals(req.user._id)) {
          review = _.merge(review, req.body);
          return review.save({
              new: true
            })
            .then(response => res.status(200).json(response))
            .catch(err => next(err));
        } else {
          return res.status(500).send('This is not your review - you cannot change it.');
        }

      } else {
        next('Podcast was null');
      }
    });
}

/**
* Permanently remove a podcast
*/
function destroy(req, res) {
  return Review.findById(req.params.id).exec()
  .then(review => {
    if(review.reviewer.equals(req.user._id)) {
      return Review.findByIdAndRemove(req.params.id).exec()
        .then(function() {
          res.status(204).end();
        })
        .catch(handleError(res));
    } else {
      return res.status(500).send('This is not your review - you cannot delete it.')
    }
  });
}
