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
 * @apiSuccess {ObjectId} _id the podcast's unique ID
 * @apiSuccess {Object[]} podcasts array of podcasts
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
 * @apiSuccess {ObjectId} _id the podcast's unique ID
 * @apiSuccess {String} name the podcast name
 * @apiSuccess {String} link the link to listen to the podcast
 * @apiSuccess {Date} release the date the podcast was released
 * @apiSuccess {String} producer the podcast producer
 * @apiSuccess {String} length the length of the podcast - this could be the total number of episodes, or the time length, you choose
 * @apiSuccess {String} description the description or summary of the podcast
 * @apiSuccess {Object[]} episodes the array of episodes associated with the podcast
 * @apiSuccess {String[]} tags short words or phrases to help find a podcast, such as category or content
 * @apiSuccess {String} imageUrl a link to a picture to use for the podcast
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
 * @apiParam {String} name (required) the podcast name
 * @apiParam {String} link (optional) the link to listen to the podcast
 * @apiParam {Date} release (optional) the date the podcast was released
 * @apiParam {String} producer (optional) the podcast producer
 * @apiParam {String} length (optional) the length of the podcast - this could be the total number of episodes, or the time length, you choose
 * @apiParam {String} description (required) the description or summary of the podcast
 * @apiParam {Object[]} episodes (optional) the array of episodes associated with the podcast
 * @apiParam {String[]} tags (optional) short words or phrases to help find a podcast, such as category or content
 * @apiParam {String} imageUrl (optional) a link to a picture to use for the podcast
 * @apiSuccess {ObjectId} _id the podcast's unique ID
 * @apiSuccess {String} name the podcast name
 * @apiSuccess {String} link the link to listen to the podcast
 * @apiSuccess {Date} release the date the podcast was released
 * @apiSuccess {String} producer the podcast producer
 * @apiSuccess {String} length the length of the podcast - this could be the total number of episodes, or the time length, you choose
 * @apiSuccess {String} description the description or summary of the podcast
 * @apiSuccess {Object[]} episodes the array of episodes associated with the podcast
 * @apiSuccess {String[]} tags short words or phrases to help find a podcast, such as category or content
 * @apiSuccess {String} imageUrl a link to a picture to use for the podcast
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
 * @apiPermission must be logged in
 * @apiParam {String} name (optional) the podcast name
 * @apiParam {String} link (optional) the link to listen to the podcast
 * @apiParam {Date} release (optional) the date the podcast was released
 * @apiParam {String} producer (optional) the podcast producer
 * @apiParam {String} length (optional) the length of the podcast - this could be the total number of episodes, or the time length, you choose
 * @apiParam {String} description (optional) the description or summary of the podcast
 * @apiParam {Object[]} episodes (optional) the array of episodes associated with the podcast
 * @apiParam {String[]} tags (optional) short words or phrases to help find a podcast, such as category or content
 * @apiParam {String} imageUrl (optional) a link to a picture to use for the podcast
 * @apiSuccess {ObjectId} _id the podcast's unique ID
 * @apiSuccess {String} name the podcast name
 * @apiSuccess {String} link the link to listen to the podcast
 * @apiSuccess {Date} release the date the podcast was released
 * @apiSuccess {String} producer the podcast producer
 * @apiSuccess {String} length the length of the podcast - this could be the total number of episodes, or the time length, you choose
 * @apiSuccess {String} description the description or summary of the podcast
 * @apiSuccess {Object[]} episodes the array of episodes associated with the podcast
 * @apiSuccess {String[]} tags short words or phrases to help find a podcast, such as category or content
 * @apiSuccess {String} imageUrl a link to a picture to use for the podcast
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
 * @apiPermission must be logged in
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
