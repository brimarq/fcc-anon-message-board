/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

// var expect = require('chai').expect;
const apiController = require('../controllers/apiController');

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .get(apiController.getRecentThreads)
    .post(apiController.createThread)
    .put(apiController.reportThread)
    .delete(apiController.deleteThread);
    
  app.route('/api/replies/:board')
    .get(apiController.getFullThread)
    .post(apiController.createReply)
    .put(apiController.reportReply)
    .delete(apiController.deleteReply);

};
