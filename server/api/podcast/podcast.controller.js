'use strict';

const Podcast = require('./podcast.model');
const mongoose = require('mongoose');
const _ = require('lodash');

module.exports = {
    getOne: getOne,
    getAll: getAll,
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
 * @api {get} podcast/ Get all the podcasts
 * @apiName getAll
 * @apiGroup Podcast
 * @apiSuccess {ObjectId} _id
 * @apiSuccess {Object[]} podcasts
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
 *         "_id": "012345678912",
 *         "name": "Kelleigh\'s Awesome Podcast",
 *         "link": 'https://facebook.com',
 *         "release": 'Sun May 30 18:47:06 +0000 2010',
 *         "producer": "Judge Baylor",
 *         "length": 60,
 *         "description": "A thrilling epic chronicling the life of Kelleigh",
 *         "episodes": [{
 *             "number": 1,
 *             "name": 'Early Childhood',
 *             "link": 'https://facebook.com',
 *             "description": 'My early life in 20 minutes',
 *             "imageUrl": 'https://www.credera.com/wp-content/uploads/2015/06/insights-thumbnail.jpg'
 *         }, {
 *             "number": 2,
 *             "name": 'Late Childhood',
 *             "link": 'https://facebook.com',
 *             "description": 'My late childhood life in 20 minutes',
 *             "imageUrl": 'https://www.credera.com/wp-content/uploads/2015/06/insights-thumbnail.jpg'
 *         }]
 *       },
 *       {
 *         "_id": "012345678912",
 *         "name": "John\'s Awesome Podcast",
 *         "link": 'https://facebook.com',
 *         "release": 'Sun May 30 18:47:06 +0000 2010',
 *         "producer": "Judge Baylor",
 *         "length": 60,
 *         "description": "A thrilling epic chronicling the life of John",
 *         "episodes": [{
 *             "number": 1,
 *             "name": 'Early Childhood',
 *             "link": 'https://facebook.com',
 *             "description": 'My early life in 20 minutes',
 *             "imageUrl": 'https://www.credera.com/wp-content/uploads/2015/06/insights-thumbnail.jpg'
 *         }, {
 *             "number": 2,
 *             "name": 'Late Childhood',
 *             "link": 'https://facebook.com',
 *             "description": 'My late childhood life in 20 minutes',
 *             "imageUrl": 'https://www.credera.com/wp-content/uploads/2015/06/insights-thumbnail.jpg'
 *         }]
 *     }]
 */
function getAll(req, res) {
    return Podcast.find({}).exec()
        .then(podcasts => {
            res.status(200).json(podcasts);
        });
}

/**
 * @api {get} podcast/:id Get one podcast
 * @apiName getOne
 * @apiGroup Podcast
 * @apiSuccess {ObjectId} _id
 * @apiSuccess {String} name
 * @apiSuccess {String} link
 * @apiSuccess {Date} release
 * @apiSuccess {String} producer
 * @apiSuccess {String} length
 * @apiSuccess {String} description
 * @apiSuccess {Object[]} episodes
 * @apiSuccess {String[]} tags
 * @apiSuccess {String} imageUrl
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": "012345678912",
 *       "name": "Kelleigh\'s Awesome Podcast",
 *       "link": 'https://facebook.com',
 *       "release": 'Sun May 30 18:47:06 +0000 2010',
 *       "producer": "Judge Baylor",
 *       "length": 60,
 *       "description": "A thrilling epic chronicling the life of Kelleigh",
 *       "episodes": [{
 *           "number": 1,
 *           "name": 'Early Childhood',
 *           "link": 'https://facebook.com',
 *           "description": 'My early life in 20 minutes',
 *           "imageUrl": 'https://www.credera.com/wp-content/uploads/2015/06/insights-thumbnail.jpg'
 *       }, {
 *           "number": 2,
 *           "name": 'Late Childhood',
 *           "link": 'https://facebook.com',
 *           "description": 'My late childhood life in 20 minutes',
 *           "imageUrl": 'https://www.credera.com/wp-content/uploads/2015/06/insights-thumbnail.jpg'
 *       }]
 *     }
 */
function getOne(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(500).send('Not a valid podcast ID');
    }
    return Podcast.findById({
            _id: req.params.id
        }).exec()
        .then(podcast => {
            res.status(200).json(podcast);
        });
}

/**
 * @api {post} podcast/ Create a new podcast
 * @apiName create
 * @apiGroup Podcast
 * @apiPermission must be logged in
 * @apiParam {String} name
 * @apiParam {String} description
 * @apiSuccess {ObjectId} _id
 * @apiSuccess {String} name
 * @apiSuccess {String} link
 * @apiSuccess {Date} release
 * @apiSuccess {String} producer
 * @apiSuccess {String} length
 * @apiSuccess {String} description
 * @apiSuccess {Object[]} episodes
 * @apiSuccess {String[]} tags
 * @apiSuccess {String} imageUrl
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": "012345678912",
 *       "name": "Kelleigh\'s Awesome Podcast",
 *       "description": "A thrilling epic chronicling the life of Kelleigh"
 *     }
 */
function create(req, res) {
    if (!req.body.name || !req.body.description) {
        return res.status(500).send('Podcast must have a name and description.');
    }
    var newPodcast = new Podcast(req.body);

    newPodcast.save()
        .then(podcast => {
            res.status(200).json(podcast);
        })
        .catch(validationError(res));
}

/**
 * @api {put} podcast/:id Update a podcast
 * @apiName update
 * @apiGroup Podcast
 * @apiSuccess {ObjectId} _id
 * @apiSuccess {String} name
 * @apiSuccess {String} link
 * @apiSuccess {Date} release
 * @apiSuccess {String} producer
 * @apiSuccess {String} length
 * @apiSuccess {String} description
 * @apiSuccess {Object[]} episodes
 * @apiSuccess {String[]} tags
 * @apiSuccess {String} imageUrl
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": "012345678912",
 *       "name": "Kelleigh\'s Awesome Podcast",
 *       "link": 'https://facebook.com',
 *       "release": 'Sun May 30 18:47:06 +0000 2010',
 *       "producer": "Judge Baylor",
 *       "length": 60,
 *       "description": "A thrilling epic chronicling the life of Kelleigh",
 *       "episodes": [{
 *           "number": 1,
 *           "name": 'Early Childhood',
 *           "link": 'https://facebook.com',
 *           "description": 'My early life in 20 minutes',
 *           "imageUrl": 'https://www.credera.com/wp-content/uploads/2015/06/insights-thumbnail.jpg'
 *       }, {
 *           "number": 2,
 *           "name": 'Late Childhood',
 *           "link": 'https://facebook.com',
 *           "description": 'My late childhood life in 20 minutes',
 *           "imageUrl": 'https://www.credera.com/wp-content/uploads/2015/06/insights-thumbnail.jpg'
 *       }]
 *     }
 */
function update(req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(500).send('Not a valid podcast ID');
    }
    return Podcast.findById({
            _id: req.params.id
        }).exec()
        .then(podcast => {
            if (podcast !== null) {
                podcast = _.merge(podcast, req.body);
                return podcast.save({
                        new: true
                    })
                    .then(response => res.status(200).json(response))
                    .catch(err => next(err));
            } else {
                next('Podcast was null');
            }
        });
}

/**
 * @api {delete} podcast/:id Delete a podcast
 * @apiName destroy
 * @apiGroup Podcast
 */
function destroy(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(500).send('Not a valid podcast ID');
    }
    return Podcast.findByIdAndRemove(req.params.id).exec()
        .then(function() {
            res.status(204).end();
        })
        .catch(handleError(res));
}
