/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import User from '../api/user/user.model';
import fs from 'fs';

User.find({}).remove()
  .then(() => {
      User.create({
          provider: 'local',
          name: 'Test User',
          email: 'test@example.com',
          password: 'Welcome1#'
        }, {
          provider: 'local',
          name: 'Admin',
          email: 'admin@example.com',
          password: 'Welcome1#'
        }, {
          provider: 'google',
          name: 'Kelleigh Maroney',
          email: 'kelleigh.maroney@gmail.com',
          password: 'Welcome1#',
          phone: 9784605536
        })
        .then(() => {
          console.log('finished populating users');
        });
      });
