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
 * @api {post} user Create a new user
 * @apiName create
 * @apiGroup User
 * @apiParam {String} name (required) the new user's name
 * @apiParam {String} email (required) the new user's email
 * @apiParam {String} password (required) the new user's password
 * @apiSuccess {String} token the token to be used in the header of all subsequent api call, in this format: "Authorization: Bearer TOKEN"
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1N2JjNWMxMTRiNWY2NDExMDA0MzE3N2QiLCJpYXQiOjE0NzE5NjIxMjksImV4cCI6MTQ3MTk4MDEyOX0.biII7dGmEbpUvx2z0buKDUfgLt5CJehFiiXEfBpqRtg"
 *     }
 */
function create(req, res, next) {
  if(!req.body.name || !req.body.email) {
    return res.status(422).send('Users must have a name and email.');
  }
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
 * @api {get} user/me Get information about myself
 * @apiName me
 * @apiGroup User
 * @apiPermission must be logged in
 * @apiHeader {String} Authorization  Bearer {TOKEN}
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1N2E4N2VlMzZkNTU4NjExMDAxZDU4NjEiLCJpYXQiOjE0NzA2NjAzNzQsImV4cCI6MTQ3MDY3ODM3NH0.uDTYHmoDaFEDVCOyggA2mt1L5f4vpubgg2d-_6rURQA"
 *     }
 * @apiSuccess {ObjectId} _id your unique user ID
 * @apiSuccess {String} name your name
 * @apiSuccess {String} email your email address
 * @apiSuccess {String[]} interests an array of your interests
 * @apiSuccess {ObjectId[]} bookmarks an array of podcast IDs you've bookmarked
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "_id": "012345678912",
 *      "name": "Kelleigh Laine",
 *      "email": "kelleigh.maroney@gmail.com",
 *      "interests": ["technology", "politics"],
 *      "bookmarks": ["123456789123", "234567891234"]
 *     }
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
 * @api {put} user/ Update my user profile
 * @apiName update
 * @apiGroup User
 * @apiPermission must be logged in
 * @apiHeader {String} Authorization  Bearer {TOKEN}
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1N2E4N2VlMzZkNTU4NjExMDAxZDU4NjEiLCJpYXQiOjE0NzA2NjAzNzQsImV4cCI6MTQ3MDY3ODM3NH0.uDTYHmoDaFEDVCOyggA2mt1L5f4vpubgg2d-_6rURQA"
 *     }
 * @apiParam {String} name (optional) your name
 * @apiParam {String[]} interests (optional) an array of your interests
 * @apiParam {ObjectId[]} bookmarks (optional) bookmarks an array of podcast IDs you've bookmarked
 * @apiSuccess {ObjectId} _id your unique user ID
 * @apiSuccess {String} name your name
 * @apiSuccess {String} email your email address
 * @apiSuccess {String[]} interests an array of your interests
 * @apiSuccess {ObjectId[]} bookmarks an array of podcastIDs you've bookmarked
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "_id": "012345678912",
 *      "name": "Kelleigh Laine",
 *      "email": "kelleigh.maroney@gmail.com",
 *      "interests": ["technology", "politics"],
 *      "bookmarks": ["123456789123", "234567891234"]
 *     }
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
