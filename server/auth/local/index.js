'use strict';

const express = require('express');
const passport = require('passport');
const signToken = require('../auth.service').signToken;

var router = express.Router();

/**
 * @api {post} auth/local/ Login with an existing user
 * @apiName authenticate
 * @apiGroup Auth
 * @apiParam {String} email (required) the new user's email
 * @apiParam {String} password (required) the new user's password
 * @apiSuccess {String} token the token to be used in the header of all subsequent api call, in this format: "Authorization: Bearer TOKEN"
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1N2E4Yjg1NmJiY2IxMDExMDBlZWU1MzQiLCJpYXQiOjE0NzE5NjIzMjUsImV4cCI6MTQ3MTk4MDMyNX0.uzeLD8shxeZq5fxRu_I0h7XAuQEDDaynLLgkcyCWC5s"
 *     }
 */
router.post('/', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    var error = err || info;
    if (error) {
      return res.status(401).json(error);
    }
    if (!user) {
      return res.status(404).json({message: 'Something went wrong, please try again.'});
    }

    var token = signToken(user._id, user.role);
    res.json({ token });
  })(req, res, next)
});

module.exports = router;
