const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');
const config = require('../server/config/config');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { logError, logInfo } = require('./common/logger');
try {
  // Use Node's default promise instead of Mongoose's promise library
  mongoose.Promise = global.Promise;

  // Connect to the database
  mongoose.connect(config.db, {
    socketTimeoutMS: 0,
    keepAlive: true,
    reconnectTries: 30
  })
    .then(() => logInfo("Connected to the database."))
    .catch((err) => logError(err));

  const app = express();

  app.set("view engine", 'ejs');

  app.use(express.static(path.join(__dirname, '../build')));

  var port = config.serverPort;

  app.use(bodyParser.json());

  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(cors());
  app.use(fileUpload());

  // Initialize routes middleware
  try {
    app.use('/api/projects', require('../server/routes/projects'));

    app.use('/api/tasks', require('../server/routes/tasks'));

    app.use('/api/subTasks', require('../server/routes/subTasks'));

    app.use('/api/users', require('../server/routes/users'));

    app.use('/api/categories', require('../server/routes/categories'));
    app.use('/api/subjects', require('../server/routes/subjects'));
    app.use('/api/companies', require('../server/routes/companies'));
    app.use('/api/projectUsers', require('../server/routes/projectUsers'));
    app.use('/api/messages', require('../server/routes/messages'));
    app.use('/api/uploadFiles', require('../server/routes/uploadFiles'));
    app.use('/api/cloneprojects', require('../server/routes/projectClone'));
    app.use('/api/clonetasks', require('../server/routes/taskClone'));
    app.use('/api/taskTypes', require('../server/routes/taskTypes'));
    app.use('/api/userRoles', require('../server/routes/userRoles'));
    app.use('/api/reports', require('../server/routes/reports/reportsRoute'));
    app.use('/api/scheduler', require('../server/routes/scheduler'));
    app.use('/api/dsrScheduler', require('../server/routes/dsrScheduler'));
    app.use('/api/projectAutoCloneScheduler', require('../server/routes/projectAutoCloneScheduler'));
    app.use('/api/favoriteprojects', require('../server/routes/favoriteProject'));
    app.use('/api/notifications', require('../server/routes/notification'));
    app.use('/api/accessRights', require('../server/routes/accessRights'));
    app.use('/api/autoClones', require('../server/routes/autoClones'));
    app.use('/api/uploadProfile', require('../server/routes/uploadProfile'));


    app.get('*', (req, res) => {
      //console.log(req.header,path.join(__dirname, '../build/index.html'));
      res.sendFile(path.join(__dirname, '../build/index.html'));
    });

  }
  catch (e) {
    // console.log(e);
  }

  // Use express's default error handling middleware
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    res.status(400).json({ err: err });
  });

  // console.log("config.secureSite", config.secureSite, config.securePort, __dirname, path.join(__dirname, config.servercertkey));
  if (config.secureSite === true) {
    const httpsOptions = {
      key: fs.readFileSync(path.join(__dirname, config.servercertkey), 'utf8'),
      cert: fs.readFileSync(path.join(__dirname, config.servercert), 'utf8')
    }
    const server = https.createServer(httpsOptions, app);
    server.listen(config.securePort, () => {
      // console.log('server running at ' + config.securePort)
      logInfo(`Listening on port ${config.securePort}`);
    })
  }
  else {
    app.listen(port, function () {
      // console.log(`Listening on port ${port}`);
      logInfo(`Listening on port ${port}`);
    });
  }

}
catch (e) {
  // console.log(e);
}