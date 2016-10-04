'use strict';

const Review = require('./review.model');
const mongoose = require('mongoose');
const _ = require('lodash');

module.exports = {
    getMine: getMine,
    getForPodcast: getForPodcast,
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
 * @api {get} api/review/mine Get all the reviews I've submitted
 * @apiName getMine
 * @apiGroup Review
 * @apiPermission must be logged in
 * @apiHeader {String} Authorization  Bearer {TOKEN}
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1N2E4N2VlMzZkNTU4NjExMDAxZDU4NjEiLCJpYXQiOjE0NzA2NjAzNzQsImV4cCI6MTQ3MDY3ODM3NH0.uDTYHmoDaFEDVCOyggA2mt1L5f4vpubgg2d-_6rURQA"
 *     }
 * @apiSuccess {Object[]} reviews array of reviews you've written
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
 *         "_id": "012345678912",
 *         "name": "It was... ok",
 *         "podcast": '012345678918',
 *         "episode": 'null',
 *         "rating": 3,
 *         "review": "I thought it would be better, but it was ok. Not thrilling by any means.",
 *         "spoilers": "false"
 *         "reviewer": {
 *            _id: "012345678925",
 *            name: "Kelleigh Maroney"
*           }
 *       },
 *       {
 *         "_id": "012345678915",
 *         "name": "It was... awesome!!!",
 *         "podcast": '012345678920',
 *         "episode": 'null',
 *         "rating": 5,
 *         "review": "I thought it was just as thrilling as the description suggested!",
 *         "spoilers": "false"
 *         "reviewer": {
 *            _id: "012345678925",
 *            name: "Kelleigh Maroney"
 *           }
 *     }]
 */
function getMine(req, res) {
    return Review.find({
            'reviewer.id': req.user._id
        }).exec()
        .then(reviews => {
            res.status(200).json(reviews);
        });
}

/**
* @api {get} api/review/:id Get all the reviews for a specific podcast
* @apiName getForPodcast
* @apiGroup Review
* @apiSuccess {Object[]} reviews array of reviews written for specified podcast
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*     [{
*         "_id": "012345678912",
*         "name": "It was... ok",
*         "podcast": '012345678918',
*         "episode": 'null',
*         "rating": 3,
*         "review": "I thought it would be better, but it was ok. Not thrilling by any means.",
*         "spoilers": "false"
*         "reviewer": {
*            _id: "012345678924",
*            name: "Tyler Estes"
*           }
*       },
*       {
*         "_id": "012345678915",
*         "name": "It was... awesome!!!",
*         "podcast": '012345678918',
*         "episode": 'null',
*         "rating": 5,
*         "review": "I thought it was just as thrilling as the description suggested!",
*         "spoilers": "false"
*         "reviewer": {
*            _id: "012345678925",
*            name: "Kelleigh Maroney"
*           }
*     }]
*/
function getForPodcast(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(500).send('Not a valid podcast ID');
    }
    return Review.find({
            podcast: req.params.id
        }).exec()
        .then(reviews => {
            res.status(200).json(reviews);
        });
}

 /**
 * @api {post} api/review/ Create a new review
 * @apiName create
 * @apiGroup Review
 * @apiPermission must be logged in
 * @apiHeader {String} Authorization  Bearer {TOKEN}
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1N2E4N2VlMzZkNTU4NjExMDAxZDU4NjEiLCJpYXQiOjE0NzA2NjAzNzQsImV4cCI6MTQ3MDY3ODM3NH0.uDTYHmoDaFEDVCOyggA2mt1L5f4vpubgg2d-_6rURQA"
 *     }
 * @apiParam {ObjectId} podcast (required) ID of podcast the review is for
 * @apiParam {String} name (required) the name or title for the review
 * @apiParam {Number} episode (optional) the episode of the podcast the review is for - if null, refers to the podcast as a whole, not a specific episode
 * @apiParam {Number} rating (required) the score given to the review - you must decide and control the min/max scores allowed
 * @apiParam {String} review (required) the text of the review
 * @apiParam {Boolean} spoilers (required) flag for whether the review will contain spoilers or not
 * @apiSuccess {ObjectId} _id the review's unique ID
 * @apiSuccess {String} name the name or title for the review
 * @apiSuccess {ObjectId} podcast ID of podcast the review is for
 * @apiSuccess {Number} episode the episode of the podcast the review is for - if null, refers to the podcast as a whole, not a specific episode
 * @apiSuccess {Number} rating the score given to the review - you must decide and control the min/max scores allowed
 * @apiSuccess {String} review the text of the review
 * @apiSuccess {Boolean} spoilers flag for whether the review will contain spoilers or not
 * @apiSuccess {Object} reviewer the ID and name of the writer of the review
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
 *         "_id": "012345678912",
 *         "name": "It was... ok",
 *         "podcast": '012345678918',
 *         "episode": 'null',
 *         "rating": 3,
 *         "review": "I thought it would be better, but it was ok. Not thrilling by any means.",
 *         "spoilers": "false"
 *         "reviewer": {
 *             _id: "012345678924",
 *            name: "Tyler Estes"
 *           }
 *       }
 */
function create(req, res) {
    if (!req.body.podcast || !req.body.review || !req.body.rating || !req.body.name || req.body.spoilers === undefined) {
        return res.status(500).send('Review must include podcast id, name, spoilers indicator, rating, and text.');
    }
    var newReview = new Review(req.body);
    newReview.reviewer = {
        id: req.user._id,
        name: req.user.name
    };
    return Review.find({
            'reviewer.id': newReview.reviewer.id,
            podcast: newReview.podcast,
            episode: newReview.episode
        }).exec()
        .then(function(reviews) {
            if (reviews.length > 0) {
                return res.status(500).send('You already have a review for this podcast/episode!');
            } else {
                return newReview.save()
                    .then(review => {
                        res.status(200).json(review);
                    })
                    .catch(validationError(res));
            }
        });
}

/**
* @api {put} api/review/:id Update one of my reviews
* @apiName update
* @apiGroup Review
* @apiPermission must be logged in, review must be their own
* @apiHeader {String} Authorization  Bearer {TOKEN}
* @apiHeaderExample {json} Header-Example:
*     {
*       "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1N2E4N2VlMzZkNTU4NjExMDAxZDU4NjEiLCJpYXQiOjE0NzA2NjAzNzQsImV4cCI6MTQ3MDY3ODM3NH0.uDTYHmoDaFEDVCOyggA2mt1L5f4vpubgg2d-_6rURQA"
*     }
* @apiParam {ObjectId} podcast (optional) ID of podcast the review is for
* @apiParam {String} name (optional) the name or title for the review
* @apiParam {Number} episode (optional) the episode of the podcast the review is for - if null, refers to the podcast as a whole, not a specific episode
* @apiParam {Number} rating (optional) the score given to the review - you must decide and control the min/max scores allowed
* @apiParam {String} review (optional) the text of the review
* @apiParam {Boolean} spoilers (optional) flag for whether the review will contain spoilers or not
* @apiSuccess {ObjectId} _id the review's unique ID
* @apiSuccess {String} name the name or title for the review
* @apiSuccess {ObjectId} podcast ID of podcast the review is for
* @apiSuccess {Number} episode the episode of the podcast the review is for - if null, refers to the podcast as a whole, not a specific episode
* @apiSuccess {Number} rating the score given to the review - you must decide and control the min/max scores allowed
* @apiSuccess {String} review the text of the review
* @apiSuccess {Boolean} spoilers flag for whether the review will contain spoilers or not
* @apiSuccess {Object} reviewer the ID and name of the writer of the review
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*     [{
*         "_id": "012345678912",
*         "name": "It was... ok",
*         "podcast": '012345678918',
*         "episode": 'null',
*         "rating": 3,
*         "review": "I thought it would be better, but it was ok. Not thrilling by any means.",
*         "spoilers": "false"
*         "reviewer": {
*            _id: "012345678924",
*            name: "Tyler Estes"
*           }
*       }
*/
function update(req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(500).send('Not a valid podcast ID');
    }
    return Review.findById({
            _id: req.params.id
        }).exec()
        .then(review => {
            if (review !== null) {
                if (req.user._id.equals(review.reviewer.id)) {
                    review = _.merge(review, req.body);
                    return review.save({
                            new: true
                        })
                        .then(response => res.status(200).json(response))
                        .catch(err => next(err));
                } else {
                    return res.status(500).send('This is not your review - you cannot change it.');
                }
            } else {
                next('Podcast was null');
            }
        });
}

/**
 * @api {delete} api/review/:id Delete a review
 * @apiName destroy
 * @apiGroup Review
 * @apiPermission must be logged in, review must be their own
 * @apiHeader {String} Authorization  Bearer {TOKEN}
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1N2E4N2VlMzZkNTU4NjExMDAxZDU4NjEiLCJpYXQiOjE0NzA2NjAzNzQsImV4cCI6MTQ3MDY3ODM3NH0.uDTYHmoDaFEDVCOyggA2mt1L5f4vpubgg2d-_6rURQA"
 *     }
 */
function destroy(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(500).send('Not a valid podcast ID');
    }
    return Review.findById(req.params.id).exec()
        .then(review => {
            if (req.user._id.equals(review.reviewer.id)) {
                return Review.findByIdAndRemove(req.params.id).exec()
                    .then(function() {
                        res.status(204).end();
                    })
                    .catch(handleError(res));
            } else {
                return res.status(500).send('This is not your review - you cannot delete it.');
            }
        });
}
