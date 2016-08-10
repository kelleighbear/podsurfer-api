'use strict';

const app = require('../..');
const mongoose = require('mongoose');
const User = require('./user.model');
const request = require('supertest');
const expect = require('chai').expect;
const _ = require('lodash');

describe('User Controller', function() {
  let user;

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
      });
  });

  // Clear users after testing
  after(function() {
    return User.remove();
  });

  describe('POST /api/user', function() {
    it('should fail to create a user with an insecure password', function(done) {
      let user2 = new User({
        name: 'Fake User2',
        email: 'test@example2.com',
        password: 'badpass'
      });
      request(app)
        .post('/api/user')
        .send(user2)
        .expect(422, done);
    });

    it('should fail to create a user with an invalid email', function(done) {
      let user2 = new User({
        name: 'Fake User2',
        email: 'test',
        password: 'password0W#'
      });
      request(app)
        .post('/api/user')
        .send(user2)
        .expect(422, done);
    });

    it('should fail to create a user with no name', function(done) {
      let user2 = new User({
        email: 'test@test.com',
        password: 'password0W#'
      });
      request(app)
        .post('/api/user')
        .send(user2)
        .expect(422, done);
    });
    
    it('should create a valid user', function(done) {
      let user2 = new User({
        name: 'Kelleigh Laine',
        email: 'kmaroney@credera.com',
        password: 'password0W#'
      });
      request(app)
        .post('/api/user')
        .send(user2)
        .expect(200, done);
    });
  });

  describe('PUT /api/user/:id', function() {
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

    it('should update a user', function(done) {
      let updatedUser = _.merge(user, {
          interests: ['technology']
        });
      request(app)
        .put('/api/user/')
        .set('authorization', 'Bearer ' + token)
        .send(updatedUser)
        .expect(200)
        .end((err, res) => {
          expect(err).to.not.exist;
          let result = res.body;
          expect(result.interests.length).to.equal(1);
          expect(result.name).to.equal('Fake User');
          done();
        });
    });
  });

});
