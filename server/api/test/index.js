'use strict';

const Router = require('express').Router;
const controller = require('./test.controller');


var router = new Router();

// GET
router.get('/', controller.test);

module.exports = router;
