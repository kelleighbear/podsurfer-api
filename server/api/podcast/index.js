'use strict';

const Router = require('express').Router;
const controller = require('./podcast.controller');
const auth = require('../../auth/auth.service');


var router = new Router();

// Endpoints
router.get('/', auth.isAuthenticated(), controller.get);

router.post('/', auth.isAuthenticated(), controller.create);

router.put('/:id', auth.isAuthenticated(), controller.update);

module.exports = router;
