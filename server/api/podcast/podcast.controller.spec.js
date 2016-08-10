'use strict';

const app = require('../..');
const mongoose = require('mongoose');
const User = require('../user/user.model');
const Podcast = require('./podcast.model');
const request = require('supertest');
const expect = require('chai').expect;
const _ = require('lodash');

describe('Podcast Controller', function() {
    let user, podcast1, podcast2;

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
            .then(() => Podcast.create({
                name: 'AliPodcast',
                description: 'A thrilling podcast detailing the life of Ali Momin.'
            }))
            .then(newPodcast => {
                podcast2 = newPodcast;
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

    describe('POST /api/podcast/', function() {
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
                .post('/api/podcast')
                .expect(401, done);
        });

        it('should fail to create a podcast with no name', function(done) {
            let podcast = {};
            request(app)
                .post('/api/podcast')
                .set('authorization', 'Bearer ' + token)
                .send(podcast)
                .expect(500, done);
        });

        it('should fail to create a podcast with no description', function(done) {
            let podcast = {
                name: 'KellPodcast'
            };
            request(app)
                .post('/api/podcast')
                .set('authorization', 'Bearer ' + token)
                .send(podcast)
                .expect(500, done);
        });

        it('should create a valid podcast', function(done) {
            let podcast = {
                name: 'KellPodcast',
                description: 'A thrilling podcast detailing the life of Kelleigh.'
            };
            request(app)
                .post('/api/podcast')
                .set('authorization', 'Bearer ' + token)
                .send(podcast)
                .expect(200)
                .end((err, res) => {
                    let result = res.body;
                    expect(result.name).to.equal('KellPodcast');
                    expect(result.description).to.equal('A thrilling podcast detailing the life of Kelleigh.');
                    done();
                });
        });
    });

    describe('GET /api/podcast/', function() {
        it('should get all podcasts', function(done) {
            request(app)
                .get('/api/podcast/')
                .expect(200)
                .end((err, res) => {
                    let result = res.body;
                    expect(result.length).to.equal(3);
                    done();
                });
        });
    });

    describe('GET /api/podcast/:id', function() {
        it('should fail to get a podcast with invalid ID', function(done) {
            request(app)
                .get('/api/podcast/12345')
                .expect(500, done);
        });

        it('should get a podcast', function(done) {
            request(app)
                .get('/api/podcast/' + podcast1._id)
                .expect(200)
                .end((err, res) => {
                    let result = res.body;
                    expect(result.name).to.equal('TylerPodcast');
                    expect(result.description).to.equal('A thrilling podcast detailing the life of Tyler Estes.');
                    done();
                });
        });
    });

    describe('PUT /api/podcast/:id', function() {
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

        it('should fail to update a podcast when not authenticated', function(done) {
            request(app)
                .post('/api/podcast')
                .expect(401, done);
        });

        it('should fail to update a podcast with invalid ID', function(done) {
            let updates = {
                name: 'Tyler\'s Podcast'
            };
            request(app)
                .put('/api/podcast/12345')
                .set('authorization', 'Bearer ' + token)
                .send(updates)
                .expect(500, done);
        });

        it('should fail to update a podcast with no ID', function(done) {
            let updates = {
                name: 'Tyler\'s Podcast'
            };
            request(app)
                .put('/api/podcast/')
                .set('authorization', 'Bearer ' + token)
                .send(updates)
                .expect(404, done);
        });

        it('should update a podcast', function(done) {
            let updates = {
                name: 'Tyler\'s Podcast'
            };
            request(app)
                .put('/api/podcast/' + podcast1._id)
                .set('authorization', 'Bearer ' + token)
                .send(updates)
                .expect(200)
                .end((err, res) => {
                    let result = res.body;
                    expect(result.name).to.equal('Tyler\'s Podcast');
                    expect(result.description).to.equal('A thrilling podcast detailing the life of Tyler Estes.');
                    done();
                });
        });
    });

    describe('DELETE /api/podcast/:id', function() {
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
                .delete('/api/podcast/' + podcast2._id)
                .expect(401, done);
        });

        it('should fail to delete a podcast with invalid ID', function(done) {
            request(app)
                .delete('/api/podcast/12345')
                .set('authorization', 'Bearer ' + token)
                .expect(500, done);
        });

        it('should fail to delete a podcast with no ID', function(done) {
            request(app)
                .delete('/api/podcast/')
                .set('authorization', 'Bearer ' + token)
                .expect(404, done);
        });

        it('should delete a podcast', function(done) {
            request(app)
                .delete('/api/podcast/' + podcast2._id)
                .set('authorization', 'Bearer ' + token)
                .expect(204, done);
        });
    });

});
