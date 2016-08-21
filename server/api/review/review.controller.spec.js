'use strict';

const app = require('../..');
const mongoose = require('mongoose');
const User = require('../user/user.model');
const Podcast = require('../podcast/podcast.model');
const Review = require('./review.model');
const request = require('supertest');
const expect = require('chai').expect;
const _ = require('lodash');

describe('Review Controller', function() {
    let user, podcast1, review1, review2;

    // Clear users before testing
    before(function() {
        return User.remove()
            .then(() => User.create({
                name: 'Fake User',
                email: 'test@example.com',
                password: 'password0W#'
            }))
            .then(newUser => {
                user = newUser;
                Promise.resolve();
            })
            .then(() => Podcast.remove())
            .then(() => Podcast.create({
                name: 'TylerPodcast',
                description: 'A thrilling podcast detailing the life of Tyler Estes.'
            }))
            .then(newPodcast => {
                podcast1 = newPodcast;
                Promise.resolve();
            })
            .then(() => Review.remove())
            .then(() => Review.create({
                podcast: podcast1._id,
                review: 'A thrilling podcast detailing the life of Tyler Estes... Best thing I\'ve ever listened to in my life',
                rating: 4.5
            }))
            .then(newReview => {
                review1 = newReview;
                Promise.resolve();
            });
    });

    // Clear users after testing
    after(function() {
        return User.remove();
    });

    // Clear podcasts after testing
    after(function() {
        return Podcast.remove();
    });

    // Clear reviews after testing
    after(function() {
        return Review.remove();
    });

    describe('POST /api/review', function() {
        var token;

        before(function(done) {
            request(app)
                .post('/auth/local')
                .send({
                    email: 'test@example.com',
                    password: 'password0W#'
                })
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    expect(err).to.not.exist;
                    token = res.body.token;
                    done();
                });
        });

        it('should fail to create a review when not authenticated', function(done) {
            request(app)
                .post('/api/review')
                .expect(401, done);
        });

        it('should fail to create a review with no podcast ID', function(done) {
            let review = {};
            request(app)
                .post('/api/review')
                .set('authorization', 'Bearer ' + token)
                .send(review)
                .expect(500, done);
        });

        it('should fail to create a review with no review text', function(done) {
            let review = {
                podcast: podcast1._id
            };
            request(app)
                .post('/api/review')
                .set('authorization', 'Bearer ' + token)
                .send(review)
                .expect(500, done);
        });

        it('should fail to create a review with no rating', function(done) {
            let review = {
                podcast: podcast1._id,
                review: 'omg, amazing'
            };
            request(app)
                .post('/api/review')
                .set('authorization', 'Bearer ' + token)
                .send(review)
                .expect(500, done);
        });

        it('should fail to create a review with no name', function(done) {
            let review = {
              podcast: podcast1._id,
              review: 'omg, amazing',
              rating: 4,
              spoilers: false
            };
            request(app)
                .post('/api/review')
                .set('authorization', 'Bearer ' + token)
                .send(review)
                .expect(500, done);
        });

        it('should fail to create a review with no spoilers indicator', function(done) {
            let review = {
              podcast: podcast1._id,
              review: 'omg, amazing',
              rating: 4,
              name: 'derp'
            };
            request(app)
                .post('/api/review')
                .set('authorization', 'Bearer ' + token)
                .send(review)
                .expect(500, done);
        });

        it('should create a valid review', function(done) {
            let review = {
                podcast: podcast1._id,
                review: 'omg, amazing',
                rating: 4,
                name: 'derp',
                spoilers: false
            };
            request(app)
                .post('/api/review')
                .set('authorization', 'Bearer ' + token)
                .send(review)
                .expect(200)
                .end((err, res) => {
                    review2 = res.body;
                    expect(review2.review).to.equal('omg, amazing');
                    expect(review2.rating).to.equal(4);
                    done();
                });
        });

        it('should fail to create a review by the same user for the same podcast', function(done) {
            let review = {
                podcast: podcast1._id,
                review: 'omg, hated it',
                rating: 3,
                name: 'hello',
                spoilers: true
            };
            request(app)
                .post('/api/review')
                .set('authorization', 'Bearer ' + token)
                .send(review)
                .expect(500, done);
        });
    });

    describe('GET /api/review/:id', function() {
        it('should fail to get reviews for a podcast with invalid ID', function(done) {
            request(app)
                .get('/api/review/12345')
                .expect(500, done);
        });

        it('should fail to get reviews for a podcast with no ID', function(done) {
            request(app)
                .get('/api/review/')
                .expect(404, done);
        });

        it('should get all reviews for a podcast', function(done) {
            request(app)
                .get('/api/review/' + podcast1._id)
                .expect(200)
                .end((err, res) => {
                    let result = res.body;
                    expect(result.length).to.equal(2);
                    done();
                });
        });
    });

    describe('GET /api/review/mine', function() {
        var token;

        before(function(done) {
            request(app)
                .post('/auth/local')
                .send({
                    email: 'test@example.com',
                    password: 'password0W#'
                })
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    expect(err).to.not.exist;
                    token = res.body.token;
                    done();
                });
        });

        it('should fail to get my reviews when not authenticated', function(done) {
            request(app)
                .get('/api/review/mine')
                .expect(401, done);
        });

        it('should get all my reviews', function(done) {
            request(app)
                .get('/api/review/mine')
                .set('authorization', 'Bearer ' + token)
                .expect(200)
                .end((err, res) => {
                    let result = res.body;
                    expect(result.length).to.equal(1);
                    done();
                });
        });
    });

    describe('PUT /api/review/:id', function() {
        var token;

        before(function(done) {
            request(app)
                .post('/auth/local')
                .send({
                    email: 'test@example.com',
                    password: 'password0W#'
                })
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    expect(err).to.not.exist;
                    token = res.body.token;
                    done();
                });
        });

        it('should fail to update a review when not authenticated', function(done) {
            request(app)
                .put('/api/review/' + review1._id)
                .expect(401, done);
        });

        it('should fail to update a review with invalid ID', function(done) {
            request(app)
                .put('/api/review/12345')
                .set('authorization', 'Bearer ' + token)
                .expect(500, done);
        });

        it('should fail to update a review with no ID', function(done) {
            request(app)
                .put('/api/review/')
                .set('authorization', 'Bearer ' + token)
                .expect(404, done);
        });

        it('should fail to update a review you did not write', function(done) {
            var updates = {
                episode: 1
            };
            request(app)
                .put('/api/review/' + review1._id)
                .set('authorization', 'Bearer ' + token)
                .send(updates)
                .expect(500, done);
        });

        it('should update a review', function(done) {
            let updates = {
                episode: 1
            };
            request(app)
                .put('/api/review/' + review2._id)
                .set('authorization', 'Bearer ' + token)
                .send(updates)
                .expect(200)
                .end((err, res) => {
                    let result = res.body;
                    expect(result.episode).to.equal(1);
                    expect(result.review).to.equal('omg, amazing');
                    expect(result.rating).to.equal(4);
                    done();
                });
        });
    });

    describe('DELETE /api/review/:id', function() {
        var token;

        before(function(done) {
            request(app)
                .post('/auth/local')
                .send({
                    email: 'test@example.com',
                    password: 'password0W#'
                })
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    expect(err).to.not.exist;
                    token = res.body.token;
                    done();
                });
        });

        it('should fail to create a podcast when not authenticated', function(done) {
            request(app)
                .delete('/api/review/' + review2._id)
                .expect(401, done);
        });

        it('should fail to delete a review with invalid ID', function(done) {
            request(app)
                .delete('/api/review/12345')
                .set('authorization', 'Bearer ' + token)
                .expect(500, done);
        });

        it('should fail to delete a review with no ID', function(done) {
            request(app)
                .delete('/api/review/')
                .set('authorization', 'Bearer ' + token)
                .expect(404, done);
        });

        it('should fail to delete a review that you did not write', function(done) {
            request(app)
                .delete('/api/review/' + review1._id)
                .set('authorization', 'Bearer ' + token)
                .expect(500, done);
        });

        it('should successfully delete a review', function(done) {
            request(app)
                .delete('/api/review/' + review2._id)
                .set('authorization', 'Bearer ' + token)
                .expect(204, done);
        });
    });

});
