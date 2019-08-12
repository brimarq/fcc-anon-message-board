/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
const Thread = require('../models/thread');
const fakethreads = require('../util/fakethreads');
const debug = require('debug')('app:func-tests');
const log = {
  setup: debug.extend('setup'),
  teardown: debug.extend('teardown'),
  err: debug.extend('error')
};

chai.use(chaiHttp);

suite('Functional Tests', function() {

  const data = {
    board: 'test',
    deletePassword: 'testpass',
    threadText: 'This is a test thread.',
    replyText: 'This is a test reply.',
    ids: []
  };

  const seedThreads = fakethreads.createThreadObjArr(data.board, data.deletePassword);

  suiteSetup(async function () {
    try {
      const seeded = await Thread.create(seedThreads);

      if (seeded) {
        seeded.forEach(thread => {
          let replyIds = [];
          thread.replies.forEach(reply => replyIds.push(reply._id));
          data.ids.push({thread: thread._id, replies: replyIds});
        });
        // log.setup(ids);
        return log.setup(`DB seeded with ${seeded.length} threads for board '${seeded[0].board}'.`);
      }
      
      return log.err('Error: Seeding DB failed.');

    } catch(err) {
      return log.err(err.message);
    }    

  });

  suiteTeardown(async function () {
    try{
      const cleaned = await Thread.deleteMany({ board: { $eq: 'test' } });
      
      if (cleaned) {
        data.ids = [];
        return log.teardown(`${cleaned.deletedCount} test threads cleaned from DB.`);
      }

      log.err('Test threads NOT cleaned from DB.');

    } catch(err) {
      return log.err(err.message);
    }
    
  });

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {

      test('Post a thread to a specific message board', function(done) {
        chai.request(server)
        .post('/api/threads/test')
        .send({
          text: data.threadText,
          delete_password: data.delPassword
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isDefined(res.body, 'Response body should be defined.');
          done();
        });
      });

    });
    
    suite('GET', function() {
      
      test('Get ten most recently bumped threads (<= 3 most recent replies each )', function(done) {
        chai.request(server)
        .get('/api/threads/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'Returned body should be an array.');
          assert.isBelow(res.body.length, 11, 'Return <= 10 threads.');
          if (!res.body.length) return done();
          assert.property(res.body[0], '_id', 'Thread should include \'_id\' property.');
          assert.property(res.body[0], 'text', 'Thread should include \'text\' property.');
          assert.property(res.body[0], 'replies', 'Thread should include \'replies\' property.');
          assert.property(res.body[0], 'created_on', 'Thread should include \'created_on\' property.');
          assert.property(res.body[0], 'bumped_on', 'Thread should include \'bumped_on\' property.');
          assert.notProperty(res.body[0], 'delete_password', 'Thread should NOT include \'delete_password\' property.');
          assert.notProperty(res.body[0], 'reported', 'Thread should NOT include \'reported\' property.');
          assert.isArray(res.body[0].replies, '\'replies\' property should be an array.');
          assert.isBelow(res.body[0].replies.length, 4, 'Return <= 3 replies per thread.');
          data.postedThreadId = res.body[0]._id;
          done();
        });
      });

    });
    
    suite('DELETE', function() {

      test('DELETE an entire thread (incorrect password)', function(done) {
        chai.request(server)
        .delete('/api/threads/test')
        .send({
          thread_id: data.ids[0].thread,
          delete_password: 'wrongpassword'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });

      test('DELETE an entire thread (correct password)', function(done) {
        chai.request(server)
        .delete('/api/threads/test')
        .send({
          thread_id: data.ids[0].thread,
          delete_password: data.deletePassword
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          data.ids.shift();
          done();
        });
      });

    });
    
    suite('PUT', function() {

      test('Report a thread', function(done) {
        chai.request(server)
        .put('/api/threads/test')
        .send({
          thread_id: data.ids[0].thread
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success'); // fcc tester expects 'reported' (board === 'fcc')
          data.ids.shift();
          done();
        });
      });

    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {

      test('POST a reply to a specific message board thread', function(done) {
        chai.request(server)
        .post('/api/replies/test')
        .send({
          text: data.replyText,
          delete_password: data.deletePassword,
          thread_id: data.postedThreadId
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isDefined(res.body, 'Response body should be defined.');
          done();
        });
      });

    });
    
    suite('GET', function() {

      test('GET an entire thread with all its replies.', function(done) {
        chai.request(server)
        .get('/api/replies/test')
        .query({ thread_id: data.postedThreadId })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, '_id', 'Thread should include \'_id\' property.');
          assert.property(res.body, 'text', 'Thread should include \'text\' property.');
          assert.property(res.body, 'replies', 'Thread should include \'replies\' property.');
          assert.property(res.body, 'created_on', 'Thread should include \'created_on\' property.');
          assert.property(res.body, 'bumped_on', 'Thread should include \'bumped_on\' property.');
          assert.notProperty(res.body, 'delete_password', 'Thread should NOT include \'delete_password\' property.');
          assert.notProperty(res.body, 'reported', 'Thread should NOT include \'reported\' property.');
          assert.isArray(res.body.replies, '\'replies\' property should be an array.');
          assert.property(res.body.replies[0], '_id', 'Reply should include \'_id\' property.');
          assert.property(res.body.replies[0], 'text', 'Reply should include \'text\' property.');
          assert.property(res.body.replies[0], 'created_on', 'Reply should include \'created_on\' property.');
          assert.notProperty(res.body.replies[0], 'delete_password', 'Reply should NOT include \'delete_password\' property.');
          assert.notProperty(res.body.replies[0], 'reported', 'Reply should NOT include \'reported\' property.');
          assert.equal(res.body.replies[0].text, data.replyText);
          data.postedReplyId = res.body.replies[0]._id;
          done();
        });
      });

    });
    
    suite('PUT', function() {
      
      test('Report a reply', function(done) {
        chai.request(server)
        .put('/api/replies/test')
        .send({
          thread_id: data.postedThreadId,
          reply_id: data.postedReplyId
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success'); // fcc tester expects 'reported' on success (board === 'fcc')
          done();
        });
      });

    });
    
    suite('DELETE', function() {

      test('DELETE a reply (incorrect password)', function(done) {
        chai.request(server)
        .delete('/api/replies/test')
        .send({
          thread_id: data.postedThreadId,
          reply_id: data.postedReplyId,
          delete_password: 'wrongpassword'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });

      test('DELETE a reply (correct password)', function(done) {
        chai.request(server)
        .delete('/api/replies/test')
        .send({
          thread_id: data.postedThreadId,
          reply_id: data.postedReplyId,
          delete_password: data.deletePassword
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });

      test('\'Deleted\' reply text = \'[deleted]\'.', function(done) {
        chai.request(server)
        .get('/api/replies/test')
        .query({ thread_id: data.postedThreadId })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.replies[0].text, '[deleted]');
          done();
        });
      });

    });
    
  });

});
