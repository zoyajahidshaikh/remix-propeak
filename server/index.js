try {
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
  const {
    logError,
    logInfo
  } = require('./common/logger');
  const http = require('http');
  // var ios = require('socket.io');
  global.io = require('socket.io');
  var socket = require('socket.io');
  //var io = require('socket.io');
  //var socket = require('socket.io');
  const assignRights = require('./common/assign-default-right');
  const rabbitMQ = require('./rabbitMQ');

  // Use Node's default promise instead of Mongoose's promise library
  mongoose.Promise = global.Promise;

  // Connect to the database
  mongoose.connect(config.db, {
    socketTimeoutMS: 0,
    keepAlive: true,
    reconnectTries: 30
  })
    .then(() => logInfo("Connected to the database."))
    .catch((err) => console.log(err));

  const app = express();
  //var httpServer = http.createServer(app);
  // const io= ios (http)

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
    app.use('/api/login', require('../server/features/login/routes/login-route'));
    app.use('/api/projects', require('../server/routes/projects/projects-route'));

    app.use('/api/tasks', require('../server/routes/tasks/tasks-route'));

    app.use('/api/subTasks', require('../server/routes/sub-tasks/subtasks-route'));

    app.use('/api/users', require('../server/routes/users/users-route'));
    app.use('/api/groups', require('../server/routes/groups/groups-route'));
    app.use('/api/categories', require('../server/routes/categories/categories-route'));
    app.use('/api/subjects', require('../server/routes/subjects/subjects-route'));
    app.use('/api/companies', require('../server/routes/companies/companies-route'));
    //app.use('/api/projectUsers', require('../server/routes/projectUsers/projectUsersRoute'));
    app.use('/api/messages', require('../server/routes/messages/messages-route'));
    app.use('/api/uploadFiles', require('../server/routes/upload-files/upload-files-route'));
    app.use('/api/cloneprojects', require('../server/routes/projects/project-clone-route'));
    app.use('/api/clonetasks', require('../server/routes/tasks/task-clone-route'));
    app.use('/api/taskTypes', require('../server/routes/tasks/task-types-route'));
    app.use('/api/userRoles', require('../server/routes/users/user-roles-route'));
    app.use('/api/reports', require('../server/routes/reports/reports-route'));
    app.use('/api/scheduler', require('../server/routes/scheduler/scheduler-route'));
    app.use('/api/dsrScheduler', require('../server/routes/dsr-scheduler/dsr-scheduler-route'));
    app.use('/api/holiday', require('../server/routes/holiday/holiday-scheduler-route'));
    app.use('/api/projectAutoCloneScheduler', require('../server/routes/project-auto-clone-scheduler/project-auto-clone-scheduler-route'));
    app.use('/api/favoriteprojects', require('../server/routes/projects/favorite-project-route'));
    app.use('/api/notifications', require('../server/routes/notification/notification-route'));
    app.use('/api/accessRights', require('../server/routes/access-rights/access-rights-route'));
    app.use('/api/autoClones', require('../server/routes/auto-clones/auto-clones-route'));
    app.use('/api/clearTokenScheduler', require('../server/routes/clear-token-scheduler/clear-token-scheduler-route'));
    app.use('/api/appLevelAccessRight', require('../server/routes/access-rights/app-level-access-right-route'));
    app.use('/api/mynotifications', require('../server/features/my-notifications/routes/my-notifications-route'));
    app.use('/api/leaves', require('../server/routes/leaves/leaves-route'));
    app.use('/api/burndown', require('../server/routes/burndown/burndown-route'));
    app.use('/api/uploadProfile', require('../server/routes/upload-files/upload-profile-picture-route'));
    app.use('/api/ProfilePic', express.static(__dirname + '/uploads'));
    app.use('/api/userAccountUnlockScheduler', require('../server/routes/user-account-unlock-scheduler/user-account-unlock-scheduler-route'));
    app.use('/api/dailySummaryReportScheduler', require('../server/routes/daily-summary-report-scheduler/daily-summary-report-scheduler-route'));
    app.use('/api/globalLevelRepository',require('../server/features/global-level-repository/routes/golbal-repository-route'));
    app.use('/api/pendingleaveapprovescheduler', require('../server/routes/pendingleave-approve-scheduler/pendingleave-approve-scheduler-route'));
  


    // app.get('*', (req, res) => {
    //   res.sendFile(path.join(__dirname, '../build/index.html'));
    // });

    //---- Route defination for Leave Application -----//

    // console.log("index.js before call");
    // assignRights.assignDefaultRights();
    // console.log("index.js after call");

  } catch (e) {
    console.log(e);
  }

  // Use express's default error handling middleware
  app.use((err, req, res, next) => {
    console.log(err);
    if (res.headersSent) return next(err);
    res.status(400).json({
      err: err
    });
  });

  app.listen(port, function () {
    console.log('server running at ' + port)
    logInfo(`Listening on port ${port}`);
  });


  // const httpsOptions = {
  //   key: fs.readFileSync(config.servercertkey, 'utf8'),
  //   cert: fs.readFileSync(config.servercert, 'utf8')
  // }
  // const server = https.createServer(httpsOptions, app)
  //   .listen(port, () => {
  //       console.log('server running at ' + port)
  //       logInfo(`Listening on port ${port}`);
  //   })

  // Chat Application using socket start
  var appdata = express();
  // server = appdata.listen(config.socketPort, function () {
  //   console.log('server is running on port 3002')
  // });
  // io = socket(server);
  server = appdata.listen(config.socketPort, function () {
    console.log('server is running on port 3002')
  });
  io = socket(server,{
    path:'/chat/socket.io'
  });
  var connections = [];
  var users = [];
  var userData = [];
  var groups = [];
  var basket = {};
  var messages = []
  let userSockets = {}
  io.on('connection', (socket) => {

    connections.push(socket);

    socket.on('forceDisconnect', function(userId){
        if (userData.indexOf(userId) != -1) {
        userData.splice(users.indexOf(userId), 1);
        users.splice(users.indexOf(userId), 1);
      }
      connections.splice(connections.indexOf(socket), 1);
      io.emit("showUsers", users);
    });

    socket.on('chatDisconnect', function(userId){
      socket.disconnect();
    });
    //   setInterval(function(){
    //     console.log('users in setInterval',users);
    //     io.emit("active", users);
    // }, 60000);


    socket.on('new user', (userId) => {

      userData.push(userId)

      for (let i = 0; i < userData.length; i++) {
        if (!users.includes(userData[i])) {
          users.push(userData[i]);
        }
      }
      socket.join(userId);
      socket.userId = userId;
      io.emit("userId", userId);
      io.emit("showUsers", users);

    });

    socket.on("my notification userId", (userId) => {
      //console.log("userId from index.js socket ", userId);


      userSockets[userId] = socket;
      //console.log("userSockets", userSockets);
    })

    setInterval(function () {

      // implementation of rabbitMQ

      rabbitMQ.receiveMessageFromQueue("notification_queue").then((resp) => {
        if (resp !== "No messages in queue") {
          //console.log(`notification:- ${resp}`)
          if (userSockets[resp.userId]) {
            let socket1 = userSockets[resp.userId];
            socket1.emit("notificationList", resp);
            // myNotificationList.splice(i, 1);
          }
        }
      })
    }, 30000);

    socket.on('new user', (userId) => {
      userData.push(userId)
      for (let i = 0; i < userData.length; i++) {
        if (!users.includes(userData[i])) {
          users.push(userData[i]);
        }
      }
      socket.join(userId);
      io.emit("userId", userId);
      io.emit("showUsers", users);

    });



    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);

    })

    socket.on('SEND_MESSAGE', function (data) {
    console.log("SEND_MESSAGE data", data)
      messages.push(data)
   // io.to(data.toUser).emit('RECEIVE_MESSAGE', data);
   io.emit('RECEIVE_MESSAGE', data);
      //io.broadcast.emit('RECEIVE_MESSAGE', data);
   socket.broadcast.emit('RECEIVE_HEADER_MESSAGE', data);

    })

    socket.on("join Group", (groupId) => {
      socket.join(groupId);
      // console.log(groupId + 'joined group' + groupId);
    })


    socket.on("create Group", (groupName) => {
      // console.log('groupName', groupName);
      groups.push(groupName);
      socket.join(groupName.createdBy);
      // console.log('groups', groups);
      io.emit("showGroups", groups);
    })


  })

} catch (e) {
  console.log("index error", e);
}

process.on('unhandledRejection', (err) => {
  console.log(err.messages)
})