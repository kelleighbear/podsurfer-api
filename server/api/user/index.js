'use strict';

const Router = require('express').Router;
const controller = require('./user.controller');
const auth = require('../../auth/auth.service');

var router = new Router();

// GET
router.get('/me', auth.isAuthenticated(), controller.me);

// POST
router.post('/', controller.create);

// PUT
router.put('/', auth.isAuthenticated(), controller.update);

// DELETE
// no delete endpoint needed

module.exports = router;
