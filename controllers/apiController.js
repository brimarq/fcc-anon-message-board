const Thread = require('../models/thread');

async function getRecentThreads(req, res) {
  const board = req.params.board.toLowerCase();
  try {
    const threads = await Thread
      .find({ board: { $eq: board }})
      .then(threads => threads.map(thread => thread.getPublicFields()));

    

    res.send(threads);

  } catch(err) {
    throw err;
  }
}

function getFullThread(req, res) {}

function createThread(req, res) {}

function reportThread(req, res) {} 

function deleteThread(req, res) {}

function createReply(req, res) {}

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