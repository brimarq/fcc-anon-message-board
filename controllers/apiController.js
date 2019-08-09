const Thread = require('../models/thread');

async function getRecentThreads(req, res) {
  const board = req.params.board.toLowerCase();
  try {
    const threads = await Thread
      .find(
        { board: { $eq: board }}, 
        null, 
        { sort: { bumped_on: 'desc', }, limit: 10 }
      )
      .then(threads => threads.map(thread => {
        thread = thread.getPublicFields();
        thread.replycount = thread.replies.length;
        thread.replies = thread.replies.sort((a, b) => b.created_on - a.created_on).slice(0, 3);
        return thread;
      }))
      .catch(err => err);

    res.send(threads);

  } catch(err) {
    throw err;
  }
}

async function getFullThread(req, res) {
  const { thread_id } = req.query;
  try {
    const thread = await Thread
      .findById(thread_id)
      .then(thread => thread.getPublicFields())
      .catch(err => ({ err }));

    res.send(thread);

  } catch(err) {
    throw err;
  }
}

async function createThread(req, res) {
  // Two `board` variables?? req.params.board OR req.body.board??
  const board = req.params.board.toLowerCase();
  const { text, delete_password } = req.body;
  const thread = new Thread({ board, text, delete_password });
  try {
    const query = await thread
      .save()
      .then(thread => `/b/${thread.board}`)
      .catch(err => ({ err }));

    query.err ? res.send(query.err) : res.redirect(query);

  } catch(err) {
    throw err;
  }
}

function reportThread(req, res) {} 

function deleteThread(req, res) {}

async function createReply(req, res) {
  const { thread_id, text, delete_password } = req.body;
  try {
    const query = await Thread
      .findOneAndUpdate(
        { _id: { $eq: thread_id } }, 
        { $push: { replies: { text, delete_password } } }, 
        { new: true }
      )
      .then(thread => `/b/${thread.board}/${thread._id}`)
      .catch(err => ({ err }));

    query.err ? res.send(query.err) : res.redirect(query);

  } catch(err) {
    throw err;
  }
  
}

function reportReply(req, res) {} 

function deleteReply(req, res) {}



module.exports = { 
  getRecentThreads, 
  getFullThread, 
  createThread, 
  reportThread, 
  deleteThread, 
  createReply, 
  reportReply,
  deleteReply
};