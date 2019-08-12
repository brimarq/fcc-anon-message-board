'use strict';
const { MONGODB_URI, NODE_ENV, PORT } = process.env;
const express = require('express');
// const expect = require('chai').expect;
const cors = require('cors');
const helmet = require('helmet');
const logger = require('morgan');
const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const glitchDeployRoute = require('./routes/glitch-deploy');
const runner = require('./test-runner');

const app = express();

// Set up mongoose connection
const mongoose = require('mongoose');
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useFindAndModify: false });
const conn = mongoose.connection;
conn.on('connected', console.log.bind(console, 'MongoDB connection successfully established.'));
conn.on('disconnected', console.log.bind(console, 'MongoDB connection closed.'));
conn.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(helmet({
  frameguard: { action: 'sameorigin' },
  dnsPrefetchControl: { allow: false },
  referrerPolicy: { policy: 'same-origin' }
}));

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only
if (NODE_ENV === 'development') app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Sample front-end
app.route('/b/:board/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/board.html');
  });
app.route('/b/:board/:threadid')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/thread.html');
  });

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);

glitchDeployRoute(app);

//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
app.listen(PORT || 3000, function () {
  console.log("Listening on port " + this.address().port);
  if(NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        var error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 1500);
  }
});

module.exports = app; //for testing
