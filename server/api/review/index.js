'use strict';

const Router = require('express').Router;
const controller = require('./review.controller');
const auth = require('../../auth/auth.service');


var router = new Router();

// Endpoints
router.get('/mine', auth.isAuthenticated(), controller.getMine);
router.get('/:id', controller.getForPodcast);

router.post('/', auth.isAuthenticated(), controller.create);

router.put('/:id', auth.isAuthenticated(), controller.update);

router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
