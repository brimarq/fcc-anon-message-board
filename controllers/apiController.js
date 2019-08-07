const Thread = require('../models/thread');

async function getRecentThreads(req, res) {
  const board = req.params.board.toLowerCase();
  try {
    const threads = await Thread
      .find({ board: { $eq: board }})
      .then(threads => threads.map(thread => thread));

    

    res.send(threads);

  } catch(err) {
    throw err;
  }
}

function getFullThread(req, res) {}

function createThread(req, res) {}

function reportThread(req, res) {} 

function deleteThread(req, res) {}

async function createReply(req, res) {
  const board = req.params.board.toLowerCase();
  const { thread_id, text, delete_password } = req.body;
  console.dir({ body: req.body }, { depth: null })
  const reply = { text, delete_password };

  try {
    const updatedThread = await Thread
      .findOneAndUpdate({ _id: { $eq: thread_id } }, { $push: { replies: reply } }, { new: true })
      .then(thread => thread);

    console.log({ updatedThread });

    res.send(updatedThread);

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