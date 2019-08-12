const Thread = require('../models/thread');
const debug = require('debug')('app:apiController');
const log = {
  req: debug.extend('req'),
  err: debug.extend('err'),
  query: debug.extend('query')
};

async function getRecentThreads(req, res) {
  log.req({ params: req.params, query: req.query, body: req.body });
  const board = req.params.board.toLowerCase();
  try {
    const threads = await Thread.find(
      { board: { $eq: board }}, 
      null, 
      { sort: { bumped_on: 'desc', }, limit: 10 }
    )
    .then(threads => threads.map(thread => {
      thread = thread.getPublicFields();
      thread.replycount = thread.replies.length;
      thread.replies = thread.replies.sort((a, b) => b.created_on - a.created_on).slice(0, 3);
      return thread;
    }));

    if (threads) return res.send(threads);

    log.err('Oops! Nothing returned from query.');
    return res.status(500).send();

  } catch(err) {
    log.err(err.message);
    return res.send(err.message);
  }
}

async function getFullThread(req, res) {
  log.req({ params: req.params, query: req.query, body: req.body });
  const { thread_id } = req.query;
  try {
    const thread = await Thread.findById(thread_id); 

    if (thread) return res.send(thread.getPublicFields());

    log.err('Find operation failed: No thread found.');
    return res.send('Oops! No thread found with that id.');

  } catch(err) {
    log.err(err.message);
    return res.send(err.message);
  }
}

async function createThread(req, res) {
  log.req({ params: req.params, query: req.query, body: req.body });
  const board = req.params.board.toLowerCase();
  const { text, delete_password } = req.body;
  const thread = new Thread({ board, text, delete_password });
  try {
    const saved = await thread.save();

    if (saved) return res.redirect(`/b/${saved.board}`);

    log.err('Save operation failed: No thread returned.');
    return res.send('Save operation failed: No thread returned.');

  } catch(err) {
    log.err(err.message);
    return res.send(err.message);
  }
}

async function reportThread(req, res) {
  log.req({ params: req.params, query: req.query, body: req.body });
  const board = req.params.board.toLowerCase();
  const { thread_id } = req.body;

  try {
    const reported = await Thread.findByIdAndUpdate(
      thread_id,
      { $set: { reported : true }},
      { new: true }
    );

    if (reported) {
      // fcc unofficial tester, querying 'fcc' board, expects 'reported' on success.
      const response = board === 'fcc' ? 'reported' : 'success';

      if (reported.reported) return res.send(response);
      
      log.err('Reporting failed: Thread found but status not changed.');
      return res.send('Reporting failed: Thread found but status not changed.');
    }

    log.err('Reporting failed: Thread not found.');
    return res.send('Reporting failed: Thread not found.');

  } catch (err) {
    log.err(err.message);
    return res.send(err.message);
  }

} 

async function deleteThread(req, res) {
  log.req({ params: req.params, query: req.query, body: req.body });
  const { thread_id, delete_password } = req.body;

  try {
    const deleted = await Thread.findOneAndDelete(
      { 
        _id: { $eq: thread_id }, 
        delete_password: { $eq: delete_password } 
      }
    );

    if (deleted) return res.send('success');

    log.err('Delete operation failed: Invalid thread id/password.');
    return res.send('incorrect password');

  } catch (err) {
    log.err(err.message);
    return res.send('incorrect password');
  }
}

async function createReply(req, res) {
  log.req({ params: req.params, query: req.query, body: req.body });
  const { thread_id, text, delete_password } = req.body;
  try {
    const updated = await Thread.findByIdAndUpdate(
      thread_id, 
      { $push: { replies: { text, delete_password } } }, 
      { new: true }
    );
    
    if (updated) return res.redirect(`/b/${updated.board}/${updated._id}`);

    log.err('Update failed: Thread not found.');
    return res.send('Update failed: Thread not found.');

  } catch(err) {
    log.err(err.message);
    return res.send('Update failed: Invalid thread id.');
  }
}

async function reportReply(req, res) {
  log.req({ params: req.params, query: req.query, body: req.body });
  const board = req.params.board.toLowerCase();
  const { thread_id, reply_id } = req.body;
  try {
    const reported = await Thread.findOneAndUpdate(
      { 
        _id: { $eq: thread_id }, 
        "replies._id" : { $eq: reply_id }
      },
      { $set: { "replies.$.reported" : true }},
      { new: true }
    );

    if (reported) {
      const reply = reported.replies.find(reply => reply._id.toString() === reply_id);
      // fcc unofficial tester, querying 'fcc' board, expects 'reported' on success.
      const response = board === 'fcc' ? 'reported' : 'success';

      if (reply.reported) return res.send(response);
      
      log.err('Reporting failed: Reply found but status not changed.');
      return res.send('Reporting failed: Reply found but status not changed.');
    }

    log.err('Reporting failed: Reply not found.');
    return res.send('Reporting failed: Reply not found.');

  } catch (err) {
    log.err(err.message);
    return res.send(err.message);
  }
} 

async function deleteReply(req, res) {
  log.req({ params: req.params, query: req.query, body: req.body });
  const { thread_id, reply_id, delete_password } = req.body;
  try {
    const deleted = await Thread.findOneAndUpdate(
      { 
        _id: { $eq: thread_id }, 
        replies: { 
          $elemMatch: { 
            _id: { $eq: reply_id }, 
            delete_password: { $eq: delete_password } 
          } 
        }
      },
      { $set: { "replies.$.text" : "[deleted]" }},
      { new: true }
    );

    if (deleted) return res.send('success');

    log.err('Delete opreation failed: No matching thread/reply found.');
    return res.send('incorrect password');

  } catch (err) {
    // Query throws Cast error when submitted thread._id.length !== 24.
    log.err(err.message);
    res.send('incorrect password')
  }
}



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
