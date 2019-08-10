require('dotenv').config();
const log = require('debug')('seeder');
const { MONGODB_URI } = process.env;
const mongoose = require('mongoose');
const fakethreads = require('./fakethreads');
const Thread = require('../models/thread');

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useFindAndModify: false });
const conn = mongoose.connection;
conn.on('connected', log('MongoDB connection successfully established.'));
conn.on('disconnected', log('MongoDB connection closed.'));
conn.on('error', log('MongoDB connection error:'));


conn.on('connected', async function() { 
  const threads = fakethreads.createThreadObjArr();
  try {
    const isThreadsCollection = await conn.db.listCollections({ name: 'threads' })
      .toArray()
      .then(results => results.length ? true : false);

    if (isThreadsCollection) {
      await conn.dropCollection('threads')
      .then(() => log('Previous threads collection dropped.'));
    }

    await Thread.create(threads, {timestamps: false})
      .then(threads => log(`Fresh threads collection seeded with ${threads.length} new threads for board ${threads[0].board}`));

    conn.close();

  } catch(err) {
    throw err;
  }
  
});

