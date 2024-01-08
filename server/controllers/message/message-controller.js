const mongoose = require('mongoose');
const Message = require('../../models/message/message-model');
const jwt = require('jsonwebtoken');
const secret = require('../../config/secret');
const audit = require('../audit-log/audit-log-controller');
const Project = require('../../models/project/project-model');
const Task = require('../../models/task/task-model');
const { logError, logInfo } = require('../../common/logger');
const access = require('../../check-entitlements');
const User = require('../../models/user/user-model');
//const nodemailer = require('nodemailer');
const { sendEmail } = require('../../common/mailer');
const config = require("../../config/config");
const { addMyNotification } = require('../../common/add-my-notifications');
const rabbitMQ = require('../../rabbitMQ');

const errors = {
  MESSAGE_DOESNT_EXIST: 'Messages do not exist',
  ADD_MESSAGE_ERROR: 'Error occurred while adding the Message',
  EDIT_MESSAGE_ERROR: 'Error occurred while updating the Message',
  DELETE_MESSAGE_ERROR: 'Error occurred while deleting the Message',
  "NOT_AUTHORIZED": "Your are not authorized"
};

exports.addMessage = ((req, res) => {
  let userRole = req.userInfo.userRole.toLowerCase();
  let accessCheck = access.checkEntitlementsForUserRole(userRole);
  if (accessCheck === false) {
    res.json({ err: errors.NOT_AUTHORIZED });
    return;
  }
  logInfo(req.body, "addMessage req.body");
  let newMessage = {
    _id: req.body._id,
    title: req.body.title,
    isDeleted: req.body.isDeleted,
    createdBy: req.body.createdBy,
    createdOn: req.body.createdOn
  }
  if (req.body.projectId && req.body.taskId !== undefined) {
    Project.findOneAndUpdate({ "_id": req.body.projectId, "tasks._id": req.body.taskId }, { $push: { 'tasks.$.messages': newMessage } })
      .then((result) => {
        logInfo(result, "Tasks addMessage result");

        let tasks = result.tasks.filter((t) => {
          return t._id.toString() === req.body.taskId;
        })

        User.find({
          isDeleted: false
        }, {
            _id: 1,
            email: 1,
            name: 1
          }, {
            lean: true
          })
          .then((result1) => {
            let userEmail = '';
            let ownerEmail = '';
            let createdBy = ''
            for (let i = 0; i < result1.length; i++) {
              if (result1[i]._id.toString() === newMessage.createdBy) {
                createdBy = result1[i].name
              }
              if (result1[i]._id.toString() === tasks[0].userId) {
                userEmail = result1[i].email;

              }
              else if (result1[i]._id.toString() === result.userid) {
                ownerEmail = result1[i].email;
              }

            }
            let toEmail = '';
            if (req.body.createdBy === result.userid) {
              toEmail = userEmail
            }

            if (req.body.createdBy === tasks[0].userId) {
              toEmail = ownerEmail
            }

            let messageLink = config.msgEmailLink + result._id + '/' + tasks[0]._id;

            let bodyHtml = config.showMessage ? 'Hi, <br> You are receiving this because message is added in <b>' + tasks[0].title + '</b> of project <b>' + result.title + '</b> in the proPeak Management System.<br>' + '<br>' +
              'Message: ' + newMessage.title + '<br>' + 'Author:' + createdBy + '<br>' +
              'Please click on the following link, ' + config.msgLink + result._id + '/' + tasks[0]._id + '/messages' + ' to view the message.<br><br> Thanks, <br> proPeak Team' :
              'Hi, <br> You are receiving this because message is added in <b>' + tasks[0].title + '</b> of project <b>' + result.title + '</b> in the proPeak Management System.<br>' + '<br>' +
              'Please click on the following link, ' + config.msgLink + result._id + '/' + tasks[0]._id + '/messages' + ' to view the message.<br><br> Thanks, <br> proPeak Team'
            
            var mailOptions = {
              from: config.from,
              to: toEmail,
              //cc: emailOwner,
              subject: 'NEW Message added in ' + result.title + ' - ' + tasks[0].title,
              html: bodyHtml
            };


            let messageArr = { subject: mailOptions.subject, url: messageLink, userId: req.body.createdBy === result.userId ? result.userId : tasks[0].userId };



            rabbitMQ.sendMessageToQueue(mailOptions, "message_queue", "msgRoute").then((resp) => {
              logInfo("message add mail message sent to the message_queue:" + resp);
              addMyNotification(messageArr);

            });

            res.json({
              success: true,
              msg: `Successfully Added!`,
            })

          })

      })
  }
  else {
    Project.findOneAndUpdate({ _id: req.body.projectId }, { $push: { messages: newMessage } })
      .then((oldResult) => {
        Project.findOne({ _id: req.body.projectId })
          .then((newResult) => {
            logInfo(newResult, "Project addMessage newResult");
            let userIdToken = req.userInfo.userName;
            let field = 'messages';
            audit.insertAuditLog('', newResult.title, 'Project', field, newMessage.title, userIdToken, newResult._id);
            res.json({
              msg: 'Successfully Added!'
            });
          })
      })
      .catch((err) => {
        res.json({ err: errors.ADD_MESSAGE_ERROR });
      });
  }
})

exports.deleteMessage = ((req, res) => {
  let userRole = req.userInfo.userRole.toLowerCase();
  let accessCheck = access.checkEntitlementsForUserRole(userRole);
  if (accessCheck === false) {
    res.json({ err: errors.NOT_AUTHORIZED });
    return;
  }
  logInfo(req.body, "deleteMessage req.body");
  if (req.body.taskId !== undefined) {
    let project = new Project;
    let tasks = project.tasks.id(req.body.taskId);
    let userId = req.userInfo.userId;
    if (userRole !== 'user' || (userRole === 'user' && userId === req.body.message.createdBy)) {
      Project.findById(req.body.projectId)
        .then((result) => {
          logInfo(result, "Tasks deleteMessage result");
          let task = result.tasks.id(req.body.taskId)
          let taskmsg = task.messages.id(req.params.id);
          taskmsg.isDeleted = req.body.message.isDeleted;
          return result.save();
        })
        .then((result) => {
          res.send({ result });
        })
        .catch(e => res.status(400).send(e));
    }

  } else {
    Project.findOneAndUpdate({ _id: req.body.projectId, 'messages._id': req.params.id },
      { $set: { 'messages.$': req.body.message } }, { "new": true })
      .then((result) => {
        logInfo(result, "Projects deleteMessage result");
        let userIdToken = req.userInfo.userName;
        var res1 = Object.assign({}, result);
        let field = 'messages';
        audit.insertAuditLog(req.body.message.title, result.title, 'Project', field, '', userIdToken, result._id);
        res.json(
          { msg: 'Successfully Deleted!' }
        );
      })
      .catch((err) => {
        res.json({ err: errors.DELETE_MESSAGE_ERROR });
      });
  }
})





