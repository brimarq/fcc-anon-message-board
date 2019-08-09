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

chai.use(chaiHttp);

suite('Functional Tests', function() {

  const delPasswd = 'testpass';
  const testThreadText = 'This is a test thread.';
  const testReplyText = 'This is a test reply.';
  let testThreadId, testReplyId;

  // suiteSetup(async function () {
    
  //   try {

  //     const booksCount = await Book.estimatedDocumentCount();
  //     if (booksCount) return;
  //     fakebook.populateBooks();

  //   } catch(err) {
  //     throw err;
  //   }    

  // });

  // suiteTeardown(function () {
  //   Book.deleteMany({title: {$eq: testBookTitle}}, err => {if (err) {throw err;}});
  // });

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {

      test('Thread to a specific message board', function(done) {
        chai.request(server)
        .post('/api/threads/test')
        .send({
          text: testThreadText,
          delete_password: delPasswd
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isDefined(res.body, 'Response body should be defined.');
          done();
        });
      });

    });
    
    suite('GET', function() {
      
      test('Ten most recently bumped threads (<= 3 most recent replies each )', function(done) {
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
          testThreadId = res.body[0]._id;
          done();
        });
      });

    });
    
    suite('DELETE', function() {

      test('DELETE an entire thread (incorrect password)', function(done) {
        chai.request(server)
        .delete('/api/threads/test')
        .send({
          thread_id: testThreadId,
          delete_password: 'drowssap'
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
          thread_id: testThreadId,
          delete_password: delPasswd
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });

    });
    
    suite('PUT', function() {

      test('Report a reply', function(done) {
        chai.request(server)
        .put('/api/replies/test')
        .send({
          thread_id: testThreadId
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success'); // fcc tester expects 'reported'
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
          text: testReplyText,
          delete_password: delPasswd,
          thread_id: testThreadId
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
        .query({ thread_id: testThreadId })
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
          assert.equal(res.body.replies[0].text, testReplyText);
          testReplyId = res.body.replies[0]._id;
          done();
        });
      });

    });
    
    suite('PUT', function() {
      
      test('Report a reply', function(done) {
        chai.request(server)
        .put('/api/replies/test')
        .send({
          thread_id: testThreadId,
          reply_id: testReplyId
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success'); // fcc tester expects 'reported'
          done();
        });
      });

    });
    
    suite('DELETE', function() {

      test('DELETE a reply (incorrect password)', function(done) {
        chai.request(server)
        .delete('/api/replies/test')
        .send({
          thread_id: testThreadId,
          reply_id: testReplyId,
          delete_password: 'drowssap'
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
          thread_id: testThreadId,
          reply_id: testReplyId,
          delete_password: delPasswd
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
        .query({ thread_id: testThreadId })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.replies[0].text, '[deleted]');
          done();
        });
      });

    });
    
  });

});
