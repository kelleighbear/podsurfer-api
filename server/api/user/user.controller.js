'use strict';

const User = require('./user.model');
const passport = require('passport');
const config = require('../../config/environment');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

module.exports = {
  create: create,
  me: me,
  update: update
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
 * Creates a new user
 */
function create(req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save()
    .then(function(user) {
      var token = jwt.sign({
        _id: user._id
      }, config.secrets.session, {
        expiresIn: 60 * 60 * 5
      });
      res.json({
        token
      });
    })
    .catch(validationError(res));
}

/**
 * Get my info
 */
function me(req, res, next) {
  var userId = req.user._id;

  return User.findOne({
      _id: userId
    }, '-salt -password').exec()
    .then(user => { // don't ever give out the password or salt
      if (!user) {
        return res.status(401).end();
      }
      res.json(user);
    })
    .catch(err => next(err));
}

/**
 * Update user
 */
function update(req, res, next) {
  var userId = req.user._id;

  return User.findById(userId).exec()
    .then(user => {
      if (user !== null) {
        user = _.merge(user, req.body);
        return user.save({
            new: true
          })
          .then(response => res.json(response))
          .catch(err => next(err));
      } else {
        next('User was null');
      }
    });
}

/**
 * Authentication callback
 */
function authCallback(req, res, next) {
  res.redirect('/');
}
