'use strict';

const Router = require('express').Router;
const controller = require('./podcast.controller');
const auth = require('../../auth/auth.service');


var router = new Router();

// GET
router.get('/:id', controller.getOne);
router.get('/', controller.getAll);

// POST
router.post('/', auth.isAuthenticated(), controller.create);

// PUT
router.put('/:id', auth.isAuthenticated(), controller.update);

// DELETE
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
