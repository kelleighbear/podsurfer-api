'use strict';

const Router = require('express').Router;
const controller = require('./podcast.controller');
const auth = require('../../auth/auth.service');


var router = new Router();

// Endpoints
router.get('/:id', controller.getOne);
router.get('/', controller.getAll);

router.post('/', auth.isAuthenticated(), controller.create);

router.put('/:id', auth.isAuthenticated(), controller.update);

router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
