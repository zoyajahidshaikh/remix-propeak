const mongoose = require('mongoose');
const Task = require('../../models/task/task-model');
const SubTask = require('../../models/sub-task/subtask-model');
const uuidv4 = require('uuid/v4');
const nodemailer = require('nodemailer');
const User = require('../../models/user/user-model');
const audit = require('../audit-log/audit-log-controller');
const fs = require('fs');
const config = require("../../config/config");
const jwt = require('jsonwebtoken');
const secret = require('../../config/secret');
const Project = require('../../models/project/project-model');
const TaskPriority = require('../../models/task/task-priority-model');
const {
  logError,
  logInfo
} = require('../../common/logger');
const { sendEmail } = require('../../common/mailer');
const accessConfig = require('../../common/validate-entitlements');
const objectId = require('../../common/common');
const errors = {
  TASK_DOESNT_EXIST: 'Task does not exist',
  ADD_TASK_ERROR: 'Error occurred while adding the Task',
  EDIT_TASK_ERROR: 'Error occurred while updating the Task',
  DELETE_TASK_ERROR: 'Error occurred while deleting the Task',
  SEARCH_PARAM_MISSING: "Please input required parameters for search",
  SERVER_ERROR: "Opps, something went wrong. Please try again.",
  NOT_AUTHORIZED: "Your are not authorized"
};
const sortData = require('../../common/common');
const dateUtil = require('../../utils/date-util');
const rabbitMQ = require('../../rabbitMQ');
const { addMyNotification } = require('../../common/add-my-notifications');
const { ObjectId } = require('mongodb');
const totalSundays = require('../../common/common');
const Holiday = require("../../models/leave/holiday-model");

exports.getTaskPriority = ((req, res) => {
  try {
    TaskPriority.find({})//.sort({displayName:1})
      .then((result) => {
        sortData.sort(result, 'displayName');

        res.json(result);
      })
      .catch((err) => {
        res.json({
          err: err
        });
      });
  }
  catch (err) {
    logError("getTaskPriority err", err);
  }
})

exports.getTasksByProjectId = ((req, res) => {
  logInfo(req.body, "getTasksByProjectId");
  let userRole = req.userInfo.userRole.toLowerCase();
  let userAccess = req.userInfo.userAccess;
  let viewAllTasks = false;
  let editAllTasks = false;
  if (userAccess !== null && userAccess !== undefined && userAccess.length > 0) {
    viewAllTasks = accessConfig.validateEntitlements(userAccess, req.params.projectId, 'Task', 'view all', userRole);
    editAllTasks = accessConfig.validateEntitlements(userAccess, req.params.projectId, 'Task', 'edit all', userRole);
  }

  let userId = req.userInfo.userId;
  if (!userRole) {
    res.json({
      err: errors.NOT_AUTHORIZED
    });
    return;
  }
  var projectId = req.params.projectId;
  var projectCondition = {
    _id: mongoose.Types.ObjectId(projectId)
  };
  var returnFields = {
    _id: 1,
    title: 1,
    description: 1,
    category: 1,
    startdate: 1,
    enddate: 1,
    notifyUsers: 1,
    projectUsers: 1,
    userGroups: 1,
    userid: 1,
    tasks: 1,
    status: 1
  };
  logInfo([projectCondition, returnFields], "getTasksByProjectId query");
  Project.find(projectCondition, returnFields)
    .then((result) => {
      let project = {};
      if (result.length > 0) {
        project._id = result[0]._id;
        project.title = result[0].title;
        project.description = result[0].description;
        project.startdate = result[0].startdate;
        project.enddate = result[0].enddate;
        project.notifyUsers = result[0].notifyUsers;
        project.projectUsers = result[0].projectUsers;
        project.userGroups = result[0].userGroups;
        project.userid = result[0].userid;
        project.category = result[0].category;
        project.status = result[0].status;

        let tasksData = [];
        let taskCount = result[0].tasks.length;
        if (taskCount > 0) {
          for (let i = 0; i < taskCount; ++i) {
            let t = result[0].tasks[i];
            if ((t.isDeleted === null || t.isDeleted === false) && (userRole !== "user" || (userRole === "user" && t.userId === userId))) {
              let subTasks = t.subtasks.filter((s) => {
                return s.isDeleted === false;
              });
              t.subtasks = subTasks;
              tasksData.push(t);
            }
          }
        }

        if (viewAllTasks === true || editAllTasks === true) {
          let tasks = result[0].tasks.filter((t) => {
            return t.isDeleted === false;
          })
          let projectTasks = tasks.length > 0 ? tasks : [];

          project.tasks = projectTasks;
        } else {
          project.tasks = tasksData;
        }
      }
      logInfo(project.tasks.length, "getTasksByProjectId task count");
      res.json(project);
    })
    .catch((err) => {
      logInfo(err, "getTasksByProjectId error");
      res.json({
        err: errors.TASK_DOESNT_EXIST
      });
    });
})

exports.getAllTasks = ((req, res) => {
  Task.find({
    $or: [{
      isDeleted: null
    }, {
      isDeleted: false
    }]
  })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.json({
        err: errors.TASK_DOESNT_EXIST
      });
    });
})


exports.createTask = ((req, res) => {
  logInfo(req.body, "createTask");

  try {


    let userAssigned = req.body.userName;
    let depTaskTitle = req.body.depTaskTitle;
    let email = req.body.email;
    let projectName = req.body.projectName;
    let projectId = req.body.task.projectId;
    let newTask = {};
    let tasks = [];
    let assignedUsers = [];
    let userIds = [];
    let mail = {};

    if (req.body.multiUsers === undefined || req.body.multiUsers.length === 0) {
      assignedUsers = [{ id: req.body.task.userId, name: userAssigned }]
    } else {
      let filterUserIds = (userIds, assignedUsers) => {
        let count = 0;
        for (let k = 0; k < userIds.length; k++) {
          count = 0;
          if (assignedUsers.length === 0) {
            assignedUsers.push(userIds[k]);
          }
          else {
            assignedUsers.forEach((u) => {
              if (u.id === userIds[k].id) {
                count++;
              }
            })
            if (count === 0) {
              assignedUsers.push(userIds[k]);
              count = 0;
            }
          }
        }
        return assignedUsers;
      }

      if (req.body.task.userId !== "") {
        (req.body.multiUsers.length > 0) && req.body.multiUsers.push({ id: req.body.task.userId, name: userAssigned });
      }
      assignedUsers = filterUserIds(req.body.multiUsers, assignedUsers);
    }

    tasks = assignedUsers.map((u) => {
      let newtask = {
        _id: objectId.mongoObjectId(),
        userId: u.id,
        title: req.body.task.title,
        description: req.body.task.description,
        completed: req.body.task.completed,
        category: req.body.task.category,
        tag: req.body.task.tag,
        status: req.body.task.status,
        storyPoint: req.body.task.storyPoint,
        startDate: req.body.task.startDate,
        endDate: req.body.task.endDate,
        depId: req.body.task.depId,
        taskType: req.body.task.taskType,
        priority: req.body.task.priority,
        createdOn: new Date(),
        createdBy: req.body.task.createdBy,
        modifiedOn: new Date(),
        modifiedBy: req.body.task.modifiedBy,
        isDeleted: req.body.task.isDeleted,
        sequence: req.body.task.sequence,
        messages: req.body.task.messages,
        uploadFiles: req.body.task.uploadFiles,
        subtasks: req.body.task.subtasks,
        dateOfCompletion: req.body.task.dateOfCompletion,
        subtaskId: req.body.task.subtaskId
      };
      return newtask;
    })

    let auditTaskAndSendMail = async (newTask, newResult, emailOwner, email) => {
      let updatedDescription = newTask.description.split("\n").join("<br/> &nbsp; &nbsp; &nbsp; &nbsp; ");
      let emailText = config.taskEmailContent.replace("#title#", newTask.title).replace("#description#", updatedDescription).replace("#projectName#", projectName).replace("#projectId#", projectId).replace("#priority#", newTask.priority.toUpperCase()).replace("#projectId#", projectId).replace("#newTaskId#", newTask._id).replace("#newTaskId#", newTask._id);
      let taskEmailLink = config.taskEmailLink.replace("#projectId#", projectId).replace("#newTaskId#", newTask._id);
      if (email === 'XX') { } else {
        var mailOptions = {
          from: config.from,
          to: email,
          cc: emailOwner,
          subject: projectName + ' - Task assigned -  ' + newTask.title,
          html: emailText
        };

        //implementation of rabbitMQ

        let taskArr = { subject: mailOptions.subject, url: taskEmailLink, userId: newTask.userId };


        rabbitMQ.sendMessageToQueue(mailOptions, "message_queue", "msgRoute").then((resp) => {
          logInfo("task add mail message sent to the message_queue:" + resp);
          addMyNotification(taskArr);
        });

      }

      let userIdToken = req.userInfo.userName;
      let fields = [];
      var res1 = Object.assign({}, newResult.tasks[0]);

      for (let keys in res1._doc) {
        if (keys !== 'createdBy' && keys !== 'createdOn' && keys !== 'modifiedBy' && keys !== 'modifiedOn' &&
          keys !== '_id' && keys !== 'subtasks') {
          fields.push(keys);
        }
      }
      fields.filter((field) => {
        if (newTask[field] !== undefined && newTask[field] !== null && newTask[field].length !== 0 && newTask[field] !== '') {
          if (field === 'userId') {
            let user = assignedUsers.filter((a) => {
              return a.id === newTask[field];
            });
            let username = (user.length > 0) ? user[0].name : "";
            audit.insertAuditLog('', newTask.title, 'Task', field, username, userIdToken, req.body.task.projectId);
          } else if (field === 'depId') {
            audit.insertAuditLog('', newTask.title, 'Task', field, depTaskTitle, userIdToken, req.body.task.projectId);
          } else {
            audit.insertAuditLog('', newTask.title, 'Task', field, newTask[field], userIdToken, req.body.task.projectId);
          }
        }
      })
      return mailOptions;

    }

    Project.findById(
      req.body.task.projectId
    )
      .then((oldResult) => {
        let allowCreateTask = true;
        for (let i = 0; i < config.projectStatusCheck.length; i++) {
          if (oldResult.status !== config.projectStatusCheck[i]) {
            allowCreateTask = false;
          } else {
            allowCreateTask = true;
            break;
          }
        }
        if (allowCreateTask === false) {
          res.json({
            err: 'You do not have permission to add a task when project status is completed.'
          })
          return;
        }

        if (tasks.length > 0) {
          for (let i = 0; i < tasks.length; i++) {
            oldResult.tasks.push(tasks[i]);
          }
        }

        oldResult.save()
          .then((newResult) => {
            logInfo("createTask newResult");

            let emailOwner = '';
            let field = 'notifyUsers';
            if (oldResult[field] !== undefined && oldResult[field] !== null && oldResult[field].length !== 0) {
              let newNotifyUsers = newResult[field].map((n) => {
                return n.emailId;
              })
              emailOwner = newNotifyUsers.join(',');
            } else {
              emailOwner = ''
            }

            if (tasks.length > 0) {
              for (let i = 0; i < tasks.length; i++) {
                if (!tasks[i].userId) {
                  auditTaskAndSendMail(tasks[i], newResult, emailOwner, email);
                }
                else {
                  User.findById(tasks[i].userId)
                    .then((result) => {
                      auditTaskAndSendMail(tasks[i], newResult, emailOwner, result.email);
                    })
                    .catch((err) => {
                      logError(err, " createTask user name error");
                    })
                }

              }

            }

            res.json({
              success: true,
              msg: `Successfully added!`,
              result: tasks.length > 0 ? tasks : []
            });
          })
          .catch((err) => {
            logError(err, "createTask");
          })
      })
  }
  catch (e) {
    console.log("add task err", e);
  }
})

// for updating the category of task, mark it as completed and on toggleEdit
exports.updateTasksSubTasks = ((req, res) => {
  logInfo("updateTasksSubTasks");
  let task = req.body.task;
  // console.log("task",task);
  let projectId = req.body.projectId;
  let updatedTask = {
    _id: task._id,
    userId: task.userId,
    title: task.title,
    description: task.description,
    completed: task.completed,
    category: task.category,
    tag: task.tag,
    status: task.status,
    storyPoint: task.storyPoint,
    startDate: task.startDate,
    endDate: task.endDate,
    depId: task.depId,
    taskType: task.taskType,
    priority: task.priority,
    createdOn: task.createdOn,
    createdBy: task.createdBy,
    modifiedOn: new Date(),
    modifiedBy: task.modifiedBy,
    isDeleted: task.isDeleted,
    sequence: task.sequence,
    subtasks: task.subtasks,
    uploadFiles: task.uploadFiles,
    messages: task.messages,
    dateOfCompletion: task.dateOfCompletion ? task.dateOfCompletion : "",
    subtaskId: req.body.task.subtaskId
  };

  Project.findOneAndUpdate({
    "_id": projectId,
    "tasks._id": task._id
  }, {
      $set: {
        'tasks.$': updatedTask
      }
    })
    .then((result) => {
      if (updatedTask.status === 'completed') {
        let emailOwner = '';
        let field = 'notifyUsers';

        if (result[field] !== undefined && result[field] !== null && result[field].length !== 0) {
          let newNotifyUsers = result[field].map((o) => {
            return o.emailId;
          })
          emailOwner = newNotifyUsers.join(',');
        } else {
          emailOwner = ''
        }

        let updatedDescription = updatedTask.description.split("\n").join("<br/> &nbsp; &nbsp; &nbsp; &nbsp; ");
        let emailText = config.taskStatusEmailContent.replace("#title#", updatedTask.title)
          .replace("#description#", updatedDescription).replace("#projectName#", result.title)
          .replace("#projectId#", projectId).replace("#priority#", updatedTask.priority.toUpperCase())
          .replace("#projectId#", projectId).replace("#newTaskId#", updatedTask._id)
          .replace("#newTaskId#", updatedTask._id);
        let taskEmailLink = config.taskEmailLink.replace("#projectId#", projectId).replace("#newTaskId#", updatedTask._id); ''

        var mailOptions = {
          from: config.from,
          to: emailOwner,
          subject: result.title + ' - Task Completed -' + updatedTask.title,
          html: emailText
        };

        let taskArray = { subject: mailOptions.subject, url: taskEmailLink, userId: updatedTask.userId };


        rabbitMQ.sendMessageToQueue(mailOptions, "message_queue", "msgRoute").then((resp) => {
          logInfo("task edit mail message sent to the message_queue:" + resp);
          addMyNotification(taskArray);

        });
      }
      let t = result.tasks.find((t) => {
        return t._id.toString() === updatedTask._id;
      });
      let userIdToken = req.userInfo.userName;
      let fields = [];
      var res1 = Object.assign({}, updatedTask);

      for (let keys in res1) {
        if (keys !== 'createdBy' && keys !== 'createdOn' && keys !== 'modifiedBy' && keys !== 'modifiedOn' && keys !== 'subtasks' &&
          keys !== '_id' && keys !== 'messages' && keys !== 'uploadFiles' && keys !== 'dateOfCompletion') {
          fields.push(keys);
        }
      }
      fields.filter((field) => {
        if (t[field] !== updatedTask[field]) {
          if (t[field].length !== 0 || updatedTask[field].length !== 0) {
            if (field === 'startDate' || field === 'endDate' || field === 'dateOfCompletion') {
              if (t[field] !== undefined && t[field] !== null && t[field] !== '') {
                if (t[field].toISOString().substr(0, 10) !== updatedTask[field]) {
                  audit.insertAuditLog(t[field], updatedTask.title, 'Task', field, updatedTask[field], userIdToken, result._id);
                } else {
                  audit.insertAuditLog('', updatedTask.title, 'Task', field, updatedTask[field], userIdToken, result._id);
                }
              }

            }
            audit.insertAuditLog(t[field], updatedTask.title, 'Task', field, updatedTask[field], userIdToken, result._id);
          }
        }
      })
      logInfo("updateTasksSubTasks before response");
      res.json({
        success: true,
        msg: `Successfully Updated!`
      })
    })
    .catch((err) => {
      logInfo(err, "updateTasksSubTasks error ");
      res.json({
        err: errors.EDIT_TASK_ERROR
      });
    });
})

//For edit of a task and sending mail
exports.updateTask = ((req, res) => {
  let userRole = req.userInfo.userRole;
  // console.log("req.body",req.body);
  logInfo("updateTask", req.body);
  let userAssigned = req.body.userName;
  let depTaskTitle = req.body.depTaskTitle;
  let email = req.body.email;
  let projectName = req.body.projectName;
  let ownerEmail = req.body.ownerEmail;

  let updatedTask = {
    _id: req.body.task._id,
    userId: req.body.task.userId,
    title: req.body.task.title,
    description: req.body.task.description,
    completed: req.body.task.completed,
    category: req.body.task.category,
    tag: req.body.task.tag,
    status: req.body.task.status,
    storyPoint: req.body.task.storyPoint,
    startDate: req.body.task.startDate,
    endDate: req.body.task.endDate,
    depId: req.body.task.depId,
    taskType: req.body.task.taskType,
    priority: req.body.task.priority,
    modifiedOn: new Date(),
    modifiedBy: req.body.task.modifiedBy,
    createdOn: req.body.task.createdOn,
    createdBy: req.body.task.createdBy,
    isDeleted: req.body.task.isDeleted,
    sequence: req.body.task.sequence,
    uploadFiles: req.body.task.uploadFiles,
    messages: req.body.task.messages,
    subtasks: req.body.task.subtasks,
    dateOfCompletion: req.body.task.dateOfCompletion ? req.body.task.dateOfCompletion : "",
    subtaskId: req.body.task.subtaskId
    // assignUserGroups: req.body.task.assignUserGroups    
  };

  // console.log("updatedTask",updatedTask);
  Project.findById(req.body.task.projectId)
    .then((oldResult) => {
      let task = (oldResult.tasks.length > 0) && oldResult.tasks.filter((t) => {
        return t._id.toString() === req.body.task._id;
      })

      if (userRole === 'user' && (task.length > 0 && task[0].status === 'completed')) {
        res.json({
          err: "You do not have permission to edit this task"
        })
        return;
      }

      if (userRole === 'user' && req.body.task.status === 'inprogress') {
        let userId = req.userInfo.userId;
        let numberOfInprogressTasks = oldResult.tasks.filter((t) => {
          return t.isDeleted === false && t.userId === userId && t.status === 'inprogress';
        })
        if (numberOfInprogressTasks.length > config.maxInprogressTaskCount) {
          res.json({
            err: 'You can only add ' + config.maxInprogressTaskCount + ' tasks in In-progress'
          })
          return;
        }
      }

      logInfo("updateTask oldResult", oldResult.length);
      let emailOwner = '';
      let field = 'notifyUsers';

      if (oldResult[field] !== undefined && oldResult[field] !== null && oldResult[field].length !== 0) {
        let newNotifyUsers = oldResult[field].map((o) => {
          return o.emailId;
        })
        emailOwner = newNotifyUsers.join(',');
      } else {
        emailOwner = ''
      }

      let updatedDescription = updatedTask.description.split("\n").join("<br/> &nbsp; &nbsp; &nbsp; &nbsp; ");
      let emailText = config.taskEmailContent.replace("#title#", updatedTask.title).replace("#description#", updatedDescription).replace("#projectName#", projectName).replace("#projectId#", req.body.task.projectId).replace("#priority#", updatedTask.priority.toUpperCase()).replace("#projectId#", req.body.task.projectId).replace("#newTaskId#", updatedTask._id).replace("#newTaskId#", updatedTask._id);
      let taskEmailLink = config.taskEmailLink.replace("#projectId#", req.body.task.projectId).replace("#newTaskId#", updatedTask._id);
      let emailData = config.taskStatusEmailContent.replace("#title#", updatedTask.title).replace("#description#", updatedDescription).replace("#projectName#", projectName).replace("#projectId#", req.body.task.projectId).replace("#priority#", updatedTask.priority.toUpperCase()).replace("#projectId#", req.body.task.projectId).replace("#newTaskId#", updatedTask._id).replace("#newTaskId#", updatedTask._id);
      var mailOptions = {}
      if (oldResult.tasks !== undefined) {
        let t = oldResult.tasks.find((t) => {
          return t._id.toString() === updatedTask._id;
        });

        if (t && (t.userId !== updatedTask.userId)) {
          mailOptions = {
            from: config.from,
            to: email,
            cc: emailOwner,
            subject: projectName + ' - Task assigned-' + updatedTask.title,
            html: emailText
          };
          let taskArray = { subject: mailOptions.subject, url: taskEmailLink, userId: updatedTask.userId };

          rabbitMQ.sendMessageToQueue(mailOptions, "message_queue", "msgRoute").then((resp) => {
            logInfo("task edit mail message sent to the message_queue:" + resp);
            addMyNotification(taskArray);

          });

        }
        if (updatedTask.status === 'completed') {
          mailOptions = {
            from: config.from,
            to: emailOwner,
            subject: projectName + ' - Task Completed -' + updatedTask.title,
            html: emailData
          };
          let taskArray = { subject: mailOptions.subject, url: taskEmailLink, userId: updatedTask.userId };

          rabbitMQ.sendMessageToQueue(mailOptions, "message_queue", "msgRoute").then((resp) => {
            logInfo("task edit mail message sent to the message_queue:" + resp);
            addMyNotification(taskArray);

          });

        }

        let userIdToken = req.userInfo.userName;
        let fields = [];
        var res1 = Object.assign({}, updatedTask);

        for (let keys in res1) {
          if (keys !== 'createdBy' && keys !== 'createdOn' && keys !== 'modifiedBy' && keys !== 'modifiedOn' && keys !== 'subtasks' &&
            keys !== '_id' && keys !== 'messages' && keys !== 'uploadFiles') {
            fields.push(keys);
          }
        }

        fields.filter((field) => {
          if (t[field] !== updatedTask[field]) {
            if (field === 'userId') {
              if (t[field] !== '') {
                let u = oldResult.projectUsers.filter((p) => {
                  return p.userId === t[field];
                });
                let oldUser = (u && u.length > 0) ? u[0].name : t[field];
                audit.insertAuditLog(oldUser, updatedTask.title, 'Task', field, userAssigned, userIdToken, req.body.task.projectId);

              } else {
                audit.insertAuditLog(t[field], updatedTask.title, 'Task', field, userAssigned, userIdToken, req.body.task.projectId);
              }
            } else if (field === 'depId') {
              if (oldResult[field] !== '') {
                let depTask = oldResult.tasks.filter((o) => {
                  return o._id === t[field];
                });
                let oldDepTask = (depTask && depTask.length > 0) ? depTask[0].title : t[field];
                audit.insertAuditLog(oldDepTask, updatedTask.title, 'Task', field, depTaskTitle, userIdToken, req.body.task.projectId);

              } else {
                audit.insertAuditLog(t[field], updatedTask.title, 'Task', field, depTaskTitle, userIdToken, req.body.task.projectId);
              }
            } else if (field === 'startDate' || field === 'endDate') {
              if (t[field] !== undefined && t[field] !== null && t[field] !== '') {
                //if (t[field].toISOString().substr(0, 10) !== updatedTask[field]) 
                if (dateUtil.DateToString(t[field]) !== updatedTask[field]) {
                  audit.insertAuditLog(t[field], updatedTask.title, 'Task', field, updatedTask[field], userIdToken, req.body.task.projectId);
                }
              } else {
                audit.insertAuditLog('', updatedTask.title, 'Task', field, updatedTask[field], userIdToken, req.body.task.projectId);
              }

            } else {
              if (t[field].length !== 0 || updatedTask[field].length !== 0) {
                audit.insertAuditLog(t[field], updatedTask.title, 'Task', field, updatedTask[field], userIdToken, req.body.task.projectId);
              }
            }
          }
        })
      }

      for (let i = 0; i < oldResult.tasks.length; i++) {
        if (oldResult.tasks[i]._id.toString() === req.body.task._id) {
          oldResult.tasks[i] = updatedTask;
        }
      }

      oldResult.save()
        .then((result) => {
          res.json({
            success: true,
            msg: `Successfully Updated!`,
            result: updatedTask
          });
        })
    })
    .catch((err) => {
      logInfo("updateTask error " + err);
      res.json({
        err: errors.EDIT_TASK_ERROR
      });
    });
})

exports.updateTasksSequence = ((req, res) => {
  try {
    let projectId = req.body.projectId;
    let tasks = req.body.tasks;
    Project.findById(projectId)
      .then((result) => {
        let allTasks = result.tasks.map((t) => {
          let t1 = t._id.toString();
          for (let i = 0; i < tasks.length; ++i) {
            if (t1 === tasks[i]._id) {
              t.sequence = tasks[i].sequence;
              t.modifiedBy = req.userInfo.userId;
              t.modifiedOn = new Date();
              break;
            }
          }
          return t;
        });
        result.tasks = allTasks;
        return result.save();
      })
      .then((result) => {
        logInfo("subTaskUpdate before reposne");
        res.json({
          success: true,
          msg: 'Successful operation',
          result: result.tasks
        });
      })
      .catch((err) => {
        logInfo("subTaskUpdate error " + err);
        res.json({
          err: errors.EDIT_SUBTASK_ERROR
        });
      });
  } catch (e) {
    logError(" updateTasksSequence e", e);
  }
})



getUsersTodaysOpenTasks = async (userRole, userId, projectid, flag, showArchive) => {

  let projectId = projectid;
  logInfo("getUsersTodaysOpenTasks");
  if (!userRole) {
    res.json({
      err: errors.NOT_AUTHORIZED
    });
    return;
  }
  let dt = new Date();
  let dt1 = new Date();
  dt1.setUTCFullYear(dt.getFullYear()), dt1.setUTCMonth(dt.getMonth()), dt1.setUTCDate(dt.getDate());
  let projectFields = {
    $project: {
      _id: 1,
      title: 1,
      status: 1,
      userid: 1,
      projectUsers: 1,
      "tasks.title": 1,
      "tasks._id": 1,
      "tasks.userId": 1,
      "tasks.description": 1,
      "tasks.startDate": 1,
      "tasks.endDate": 1,
      "tasks.isDeleted": 1,
      "tasks.category": 1,
      "tasks.status": 1,
      "tasks.completed": 1
    }
  };
  let taskCondition = {
    "tasks.isDeleted": false,
  }

  if (flag === 'duetoday') {
    taskCondition["tasks.status"] = { $ne: 'onHold' };
   
  }
  if (flag === 'newTask') {
    taskCondition["tasks.status"] = "new";
   
  }
  if (flag === 'inprogress') {
    taskCondition["tasks.status"] = "inprogress";
   
  }
  if (flag === 'overdue' || flag === 'futureTask') {
    taskCondition["tasks.status"] = { $ne: 'completed' };
   
  }
  if (flag === 'onhold') {
    taskCondition["tasks.status"] = "onHold";
   
  }

  if (flag === 'cancelled') {
    taskCondition = {
      "tasks.isDeleted": true,
    }
  }

  if (userRole !== "admin") {
    if (userRole === "owner") {
      if (flag === 'duetoday') {
        taskCondition = {
          "tasks.isDeleted": false,
          // $and: [
          //   {
          //   $or: [{
          //     userid: userId
          //   }, {
          //     "tasks.userId": userId
          //   }]
          // }],
          "tasks.status": { $ne: 'onHold' },
        }
      }
      if (flag === 'newTask') {
        taskCondition = {
          "tasks.isDeleted": false,
          "tasks.status": "new",
          // $and: [
          //   {
          //   $or: [{
          //     userid: userId
          //   }, {
          //     "tasks.userId": userId
          //   }]
          // }],
        }
      }
      if (flag === 'inprogress') {
        taskCondition = {
          "tasks.isDeleted": false,
          "tasks.status": "inprogress",
          // $and: [
          //   {
          //   $or: [{
          //     userid: userId
          //   }, {
          //     "tasks.userId": userId
          //   }]
          // }],
        }
      }
      if (flag === 'overdue') {
        taskCondition = {
          "tasks.isDeleted": false,
          "tasks.status": { $ne: 'completed' },
          // $and: [
          //   {
          //   $or: [{
          //     userid: userId
          //   }, {
          //     "tasks.userId": userId
          //   }]
          // }],
        }
      }
      if (flag === 'onhold') {
        taskCondition = {
          "tasks.isDeleted": false,
          "tasks.status": "onHold",
          // $and: [
          //   {
          //   $or: [{
          //     userid: userId
          //   }, {
          //     "tasks.userId": userId
          //   }]
          // }]
        }
      }
      if (flag === 'cancelled') {
        taskCondition = {
          "tasks.isDeleted": true,
          // $and: [
          //   {
          //   $or: [{
          //     userid: userId
          //   }, {
          //     "tasks.userId": userId
          //   }]
          // }]
        }
      }
      if (flag === 'futureTask') {
        taskCondition = {
          "tasks.isDeleted": false,
          "tasks.status": { $ne: 'completed' }
        }
      }
    }
    else {
      taskCondition["tasks.userId"] = userId;

      if (flag === 'cancelled') {
        taskCondition = {
          "tasks.isDeleted": true,
          "tasks.userId": userId
        }
      }
    }
  }
  let userCondition = {
    isDeleted: false
  };
  if (showArchive === false) {
    userCondition["archive"] = false;
  }

  if (projectId !== 'undefined' && projectId !== null && projectId !== '') {
    if (userRole === "admin") {
      userCondition["_id"] = ObjectId(projectId);
    }
    if (userRole === "owner") {
      userCondition = {
        _id: ObjectId(projectId),
        $and: [
          {
            $or: [{
              userid: userId
            }, {
              "projectUsers.userId": userId
            }]
          }],
        isDeleted: false
      }
      // userCondition.$or = [{
      //   userid: userId
      // }, {
      //   "projectUsers.userId": userId
      // }];
    }
  }
  else {
    if (userRole === "owner") {
      userCondition = {
        $and: [
          {
            $or: [{
              userid: userId
            }, {
              "projectUsers.userId": userId
            }]
          }],
        isDeleted: false
      }
    }
    if (userRole === "user") {
      userCondition = {
        isDeleted: false,
        "projectUsers.userId": userId
      }
    }
  }

  let projectCond = {
    $match: userCondition
  };
  let tasksUnwind = {
    $unwind: "$tasks"
  };
  let taskFilterCondition = {
    $match: taskCondition
  };

  logInfo([projectCond, projectFields, tasksUnwind, taskFilterCondition], "getUsersTodaysOpenTasks filtercondition");
  var result = await Project.aggregate([projectCond, projectFields, tasksUnwind, taskFilterCondition]);
  //  console.log("result",result);
  let date = dateUtil.DateToString(new Date().toISOString())
  let tasks = result.map((p) => {
    let t = {};
    t.projectId = p._id;
    t.projectTitle = p.title;
    t._id = p.tasks._id;
    t.title = p.tasks.title;
    t.description = p.tasks.description;
    t.status = p.tasks.status;
    t.startDate = p.tasks.startDate;
    t.endDate = p.tasks.endDate;
    t.userId = p.tasks.userId;
    t.completed = p.tasks.completed;
    let user = p.projectUsers.filter((u) => u.userId === p.tasks.userId.toString());
    t.userName = (user && Array.isArray(user) && user.length > 0) ? user[0].name : "";
    return t;
  });

  if (flag === "duetoday") {
    let dueTodayTaskArray = []
    for (let i = 0; i < tasks.length; i++) {
      if (dateUtil.DateToString(tasks[i].startDate) === date) {
        dueTodayTaskArray.push(tasks[i])
      }
    }
    return dueTodayTaskArray
  }
  if (flag === "overdue") {
    let overDueTaskArray = [];
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].endDate !== undefined && tasks[i].endDate !== null && tasks[i].endDate !== '') {
        if (dateUtil.DateToString(tasks[i].endDate) < date) {
          overDueTaskArray.push(tasks[i]);
        }
      }
    }

    return overDueTaskArray;
  }

  if (flag === 'futureTask') {
    let futureTaskArray = [];
    for (let i = 0; i < tasks.length; i++) {
      if ((tasks[i].endDate === undefined || tasks[i].endDate === null || tasks[i].endDate === '') && (tasks[i].startDate === undefined || tasks[i].startDate === null || tasks[i].startDate === '') && tasks[i].status !== 'onHold') {

        futureTaskArray.push(tasks[i]);
      }
    }
    return futureTaskArray;
  }
  if (flag === "newTask" || flag === 'inprogress' || flag === 'onhold' || flag === 'cancelled') {
    return tasks;
  }


}

gettodaysTasksChartData = async (userRole, userId, projectid, showArchive) => {
  logInfo("gettodaysTasksChartData");
  let projectId = projectid
  if (!userRole) {
    res.json({
      err: errors.NOT_AUTHORIZED
    });
    return;
  }
  let dt = new Date();
  let dt1 = new Date();
  dt1.setUTCFullYear(dt.getFullYear()), dt1.setUTCMonth(dt.getMonth()), dt1.setUTCDate(dt.getDate());
  let projectFields = {
    $project: {
      _id: 1,
      title: 1,
      userid: 1,
      status: 1,
      "tasks.title": 1,
      "tasks._id": 1,
      "tasks.userId": 1,
      projectUsers: 1,
      "tasks.description": 1,
      "tasks.startDate": 1,
      "tasks.endDate": 1,
      "tasks.isDeleted": 1,
      "tasks.category": 1,
      "tasks.status": 1,
      "tasks.completed": 1,
      "tasks.dateOfCompletion": 1
    }
  };
  let taskCondition = {
    "tasks.isDeleted": false,
  };

  let projCondition = {
    isDeleted: false
  };
  if (projectId) {
    projCondition["_id"] = ObjectId(projectId);
  }
  if (showArchive === false) {
    projCondition["archive"] = false;
  }
  if (userRole === "owner") {
    projCondition.$or = [{
      userid: userId
    }, {
      "projectUsers.userId": userId
    }];
  }
  if (userRole === "user") {
    projCondition={
      isDeleted: false,
      "projectUsers.userId": userId
    }
 
   
  }
  if (userRole !== "admin") {
    if (userRole === "owner") {
      taskCondition = {
        // "tasks.userId": userId,
        // $and: [
        //   {
        //     $or: [{
        //       userid: userId
        //     }
        //     , {
        //       "tasks.userId": userId
        //     }
        //   ]
        //   }],
        "tasks.isDeleted": false
      };

    } else {
      taskCondition = {
        "tasks.userId": userId,
        "tasks.isDeleted": false
      };
    }
  }
  let projectCond = {
    $match: projCondition
  };
  let tasksUnwind = {
    $unwind: "$tasks"
  };
  let taskFilterCondition = {
    $match: taskCondition
  };
  
  logInfo([projectCond, projectFields, tasksUnwind, taskFilterCondition], "gettodaysTasksChartData")
 
  var result = await Project.aggregate([projectCond, projectFields, tasksUnwind, taskFilterCondition])

  let tasks = result.map((p) => {
    let t = {};
    t.projectId = p._id;
    t.projectTitle = p.title;
    t.title = p.tasks.title;
    t.status = p.tasks.status;
    t.userId = p.tasks.userId;
    t.startDate = p.tasks.startDate;
    t.endDate = p.tasks.endDate;
    t.dateOfCompletion = p.tasks.dateOfCompletion;
    t.isDeleted = p.tasks.isDeleted
    return t;
  });

  let countArray = [];

  if (tasks.length > 0) {
    let tasksByProjectId = {}
    for (let i = 0; i < tasks.length; i++) {
      if (tasksByProjectId[tasks[i].status]) {
        tasksByProjectId[tasks[i].status].push(tasks[i]);
      }
      else {
        tasksByProjectId[tasks[i].status] = [tasks[i]];
      }
    }

    let keys = Object.keys(tasksByProjectId);
    let overDueCount = 0;
    let futureTaskCount = 0
    let todaysTaskCount = 0;
    let date = dateUtil.DateToString(new Date());
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] === 'completed') {
        let completed = tasksByProjectId[keys[i]].length;
        countArray.push({ 'name': 'Completed', 'value': completed })
      }
      else if (keys[i] === 'inprogress') {
        let inprogress = tasksByProjectId[keys[i]].length;
        for (let j = 0; j < tasksByProjectId[keys[i]].length; j++) {
          let dbDate = dateUtil.DateToString(tasksByProjectId[keys[i]][j].endDate);
          if (tasksByProjectId[keys[i]][j].endDate !== undefined && tasksByProjectId[keys[i]][j].endDate !== null && tasksByProjectId[keys[i]][j].endDate !== '') {
            if (dbDate < date) {
              overDueCount++
            }

          }
          if ((tasksByProjectId[keys[i]][j].endDate === undefined || tasksByProjectId[keys[i]][j].endDate === null || tasksByProjectId[keys[i]][j].endDate === '') && (tasksByProjectId[keys[i]][j].startDate === undefined || tasksByProjectId[keys[i]][j].startDate === null || tasksByProjectId[keys[i]][j].startDate === '')) {
            futureTaskCount++
          }
         
          // let dbDate1 = dateUtil.DateToString(tasksByProjectId[keys[i]][j].startDate);
          // if (tasksByProjectId[keys[i]][j].startDate !== undefined && tasksByProjectId[keys[i]][j].startDate !== null && tasksByProjectId[keys[i]][j].startDate !== '') {
          //   if (dbDate1 === date) {
          //     todaysTaskCount++
          //   }
          // }
         
        }
        countArray.push({ 'name': 'Running', 'value': inprogress })

      }
      else if (keys[i] === 'new') {
        let todo = tasksByProjectId[keys[i]].length;
        for (let j = 0; j < tasksByProjectId[keys[i]].length; j++) {
          let dbDate = dateUtil.DateToString(tasksByProjectId[keys[i]][j].endDate);
          if (tasksByProjectId[keys[i]][j].endDate !== undefined && tasksByProjectId[keys[i]][j].endDate !== null && tasksByProjectId[keys[i]][j].endDate !== '') {
            if (dbDate < date) {
              overDueCount++
            }
          }
          if ((tasksByProjectId[keys[i]][j].endDate === undefined || tasksByProjectId[keys[i]][j].endDate === null || tasksByProjectId[keys[i]][j].endDate === '') && (tasksByProjectId[keys[i]][j].startDate === undefined || tasksByProjectId[keys[i]][j].startDate === null || tasksByProjectId[keys[i]][j].startDate === '')) {
            futureTaskCount++
          }
          // let dbDate1 = dateUtil.DateToString(tasksByProjectId[keys[i]][j].startDate);
          // if (tasksByProjectId[keys[i]][j].startDate !== undefined && tasksByProjectId[keys[i]][j].startDate !== null && tasksByProjectId[keys[i]][j].startDate !== '') {
          //   if (dbDate1 === date) {
          //     todaysTaskCount++
          //   }
          // }
          
        }
        countArray.push({ 'name': 'New', 'value': todo })
      }
      else if (keys[i] === 'onHold') {
        let onhold = tasksByProjectId[keys[i]].length;
        for (let j = 0; j < tasksByProjectId[keys[i]].length; j++) {
          let dbDate = dateUtil.DateToString(tasksByProjectId[keys[i]][j].endDate);
          if (tasksByProjectId[keys[i]][j].endDate !== undefined && tasksByProjectId[keys[i]][j].endDate !== null && tasksByProjectId[keys[i]][j].endDate !== '') {
            if (dbDate < date) {
              overDueCount++
            }
          }
          // if ((tasksByProjectId[keys[i]][j].endDate === undefined || tasksByProjectId[keys[i]][j].endDate === null || tasksByProjectId[keys[i]][j].endDate === '') && (tasksByProjectId[keys[i]][j].startDate === undefined || tasksByProjectId[keys[i]][j].startDate === null || tasksByProjectId[keys[i]][j].startDate === '')) {
          //   futureTaskCount++
          // }
          // let dbDate1 = dateUtil.DateToString(tasksByProjectId[keys[i]][j].startDate);
          // if (tasksByProjectId[keys[i]][j].startDate !== undefined && tasksByProjectId[keys[i]][j].startDate !== null && tasksByProjectId[keys[i]][j].startDate !== '') {
          //   if (dbDate1 === date) {
          //     todaysTaskCount++
          //   }
          // }
          
        }
        countArray.push({ 'name': 'OnHold', 'value': onhold })
      }
    }
    let allTask = result.length
    //console.log("todaysTaskCount",todaysTaskCount)
    // countArray.push({ 'name': 'All', 'value': allTask })
    // countArray.push({ 'name': 'Delete', 'value': isDeleteCount })
    countArray.push({ 'name': 'Overdue', 'value': overDueCount })
    countArray.push({ 'name': 'FutureTask', 'value': futureTaskCount })
    countArray.push({ 'name': 'TodaysTask', 'value': todaysTaskCount })
  }

  return countArray;


}



getUserProductivityData = async (userRole, userId, projectid) => {

  logInfo("getUserProductivityData userInfo=");
  // logInfo(req.userInfo, "getUserProductivityData userInfo=");
  // logInfo(req.body, "getUserProductivityData");

  // let userRole = req.userInfo.userRole.toLowerCase();
  // let userId = req.userInfo.userId;

  let condition = {};

  let projectFields = {
    $project: {
      _id: 1,
      // "tasks.title": 1,
      "tasks._id": 1,
      "tasks.userId": 1,
      "tasks.startDate": 1,
      "tasks.isDeleted": 1,
      "tasks.storyPoint": 1,
      "tasks.dateOfCompletion": 1
    }
  };
  let unwindTasks = {
    $unwind: "$tasks"
  };
  if (userId !== undefined && userId !== null && userId !== '') {
    condition = {
      $and: [{
        "tasks.dateOfCompletion": {
          $ne: undefined
        }
      }, {
        "tasks.dateOfCompletion": {
          $ne: null
        }
      }, {
        "tasks.dateOfCompletion": {
          $ne: ''
        }
      }
      ],
      $and: [{
        "tasks.startDate": {
          $ne: undefined
        }
      }, {
        "tasks.startDate": {
          $ne: null
        }
      }, {
        "tasks.startDate": {
          $ne: ''
        }
      }
      ],
      "tasks.userId": userId,
      "tasks.isDeleted": false,
    }

  }

  let taskFilterCondition = {
    $match: condition
  };
  let projectCond = {};
  projectCond = {
    $match: {
      isDeleted: false
    }
  };

  logInfo([projectCond, projectFields, unwindTasks, taskFilterCondition], "getUserProductivity Data filtercondition=");
  var result = await Project.aggregate([projectCond, projectFields, unwindTasks, taskFilterCondition])
  let storyPoint
  let tasksByuserId = {}
  let yesterDayDate = dateUtil.DateToString(new Date(new Date() - 24 * 60 * 60 * 1000));
  let lastMonthDate = dateUtil.DateToString(new Date(new Date(yesterDayDate) - 1000 * 60 * 60 * 24 * 30))


  var result1 = await Holiday.find({
    $and: [
      {
        "fullDate": { "$lte": yesterDayDate }
      },
      {
        "fullDate": { "$gte": lastMonthDate }
      }
    ],
    "isActive": "1"
  })
  // .then((result1) => {
  let holidayCount = result1 && result1.length;
  let totalSunday = totalSundays.getSundayInaMonth(lastMonthDate, yesterDayDate)
  let totalHoliday = holidayCount + totalSunday;
  let oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  let daysInMonth = Math.round(Math.abs((new Date(yesterDayDate).getTime() - new Date(lastMonthDate).getTime()) / (oneDay)));

  let workingHours = (daysInMonth - totalHoliday) * config.minWorkingHours;

  if (result.length > 0) {

    for (let i = 0; i < result.length; i++) {
      let startDate = dateUtil.DateToString(result[i].tasks.startDate)
      if (startDate >= lastMonthDate || startDate <= yesterDayDate) {
        if (tasksByuserId[result[i].tasks.userId]) {
          storyPoint = tasksByuserId[result[i].tasks.userId].storyPoint + result[i].tasks.storyPoint;
          tasksByuserId[result[i].tasks.userId].storyPoint = storyPoint;
        }
        else {
          storyPoint = 0;
          storyPoint = storyPoint + result[i].tasks.storyPoint;
          tasksByuserId[result[i].tasks.userId] = { storyPoint: storyPoint, workingHours: workingHours };
        }
      }
    }

  }
  let tasks = []
  let keys = Object.keys(tasksByuserId)

  for (let i = 0; i < keys.length; i++) {
    let taskObj = {
      Storypoint: tasksByuserId[keys[i]].storyPoint,
      WorkingHours: tasksByuserId[keys[i]].workingHours,
    }
    tasks.push(taskObj)
  }
  logInfo("before response getUserProductivity Data  tasks=");
  return tasks;

  // })

}
exports.getDashboardData = (async (req, res) => {

  let projectId = req.body.projectId;
  let flag = req.body.flag;
  let userRole = req.userInfo.userRole.toLowerCase();
  let userId = req.userInfo.userId;
  let showArchive = req.body.showArchive;
  let UsersTodaysTasks = await getUsersTodaysOpenTasks(userRole, userId, projectId, flag, showArchive);

  let todaysTasksChartData = await gettodaysTasksChartData(userRole, userId, projectId, showArchive);
  let userProductivityData = await getUserProductivityData(userRole, userId, projectId, showArchive);

  let dashboardData = {
    todaysTasksChartData: todaysTasksChartData,
    userProductivityData: userProductivityData,
    UsersTodaysTasks: UsersTodaysTasks
  }
  res.json({
    success: true,
    data: dashboardData
  });

})




/////////////////////////////// Not in used

// exports.getUsersTodaysOpenTasks = ((req, res) => {
//   try {

//     let projectId = req.body.projectId;
//     logInfo("getUsersTodaysOpenTasks");
//     logInfo(req.userInfo, "getUsersTodaysOpenTasks userInfo=");
//     let userRole = req.userInfo.userRole.toLowerCase();
//     let userId = req.userInfo.userId;
//     if (!userRole) {
//       res.json({
//         err: errors.NOT_AUTHORIZED
//       });
//       return;
//     }
//     let projects = [];
//     let condition = {};
//     let dt = new Date();
//     let dt1 = new Date();
//     dt1.setUTCFullYear(dt.getFullYear()), dt1.setUTCMonth(dt.getMonth()), dt1.setUTCDate(dt.getDate());
//     let projectFields = {
//       $project: {
//         _id: 1,
//         title: 1,
//         status:1,
//         userid: 1,
//         projectUsers: 1,
//         "tasks.title": 1,
//         "tasks._id": 1,
//         "tasks.userId": 1,
//         "tasks.description": 1,
//         "tasks.startDate": 1,
//         "tasks.endDate": 1,
//         "tasks.isDeleted": 1,
//         "tasks.category": 1,
//         //"tasks.status": 1,
//         "tasks.completed": 1
//       }
//     };
//     let taskCondition = {
//       "tasks.completed": false,
//       "tasks.status": { $ne: 'onHold' },
//       $or: [{
//         "tasks.startDate": dt1
//       }, {
//         "tasks.endDate": {
//           '$lte': dt1
//         }
//       }],
//       "tasks.isDeleted": false,

//     };

//     let userCondition = {
//       isDeleted: false
//     };

//     if (projectId !== 'undefined' && projectId !== null && projectId !== '') {
//       if (userRole !== "user") {
//         userCondition["_id"] = ObjectId(projectId);
//       }
//     }


//     if (userRole !== "admin") {
//       if (userRole === "owner") {

//         taskCondition = {
//           "tasks.completed": false,
//           "tasks.status": { $ne: 'onHold' },
//           $and: [{
//             $or: [{
//               "tasks.startDate": dt1
//             }, {
//               "tasks.endDate": {
//                 '$lte': dt1
//               }
//             }]
//           }, {
//             $or: [{
//               userid: userId
//             }, {
//               "tasks.userId": userId
//             }]
//           }],
//           "tasks.isDeleted": false
//         };

//       } else {
//         taskCondition["tasks.userId"] = userId;
//       }
//     }
//     let projectCond = {
//       $match: userCondition
//     };
//     let tasksUnwind = {
//       $unwind: "$tasks"
//     };
//     let taskFilterCondition = {
//       $match: taskCondition
//     };

//     logInfo([projectCond, projectFields, tasksUnwind, taskFilterCondition], "getUsersTodaysOpenTasks filtercondition");
//     Project.aggregate([projectCond, projectFields, tasksUnwind, taskFilterCondition])
//       .then((result) => {
//         let tasks = result.map((p) => {
//           let t = {};
//           t.projectId = p._id;
//           t.status = p.status;
//           t.projectTitle = p.title;
//           t._id = p.tasks._id;
//           t.title = p.tasks.title;
//           t.description = p.tasks.description;
//           //t.status = p.tasks.status;
//           t.startDate = p.tasks.startDate;
//           t.endDate = p.tasks.endDate;
//           t.userId = p.tasks.userId;
//           let user = p.projectUsers.filter((u) => u.userId === p.tasks.userId.toString());
//           t.userName = (user && Array.isArray(user) && user.length > 0) ? user[0].name : "";
//           return t;
//         });

//         logInfo("before return -> getUsersTodaysOpenTasks tasks ");
//         res.json({
//           success: true,
//           data: (tasks.length>0) ?tasks:[]
//         });
//       })
//       .catch((err) => {
//         logError(err, " getUsersTodaysOpenTasks err");
//         res.json({
//           err: errors.SERVER_ERROR
//         });
//       });
//   } catch (e) {
//     logError(e, " getUsersTodaysOpenTasks e");
//   }
// });

// exports.gettodaysTasksChartData = ((req, res) => {
//   try {
//     logInfo("gettodaysTasksChartData");
//     logInfo(req.userInfo, "gettodaysTasksChartData userInfo=");
//     let userRole = req.userInfo.userRole.toLowerCase();
//     let projectId = req.body.projectId;
//     let userId = req.userInfo.userId;
//     if (!userRole) {
//       res.json({
//         err: errors.NOT_AUTHORIZED
//       });
//       return;
//     }
//     let dt = new Date();
//     let dt1 = new Date();
//     dt1.setUTCFullYear(dt.getFullYear()), dt1.setUTCMonth(dt.getMonth()), dt1.setUTCDate(dt.getDate());
//     let projectFields = {
//       $project: {
//         _id: 1,
//         title: 1,
//         userid: 1,
//         status: 1,
//         "tasks.title": 1,
//         "tasks._id": 1,
//         "tasks.userId": 1,
//         "tasks.description": 1,
//         "tasks.startDate": 1,
//         "tasks.endDate": 1,
//         "tasks.isDeleted": 1,
//         "tasks.category": 1,
//         "tasks.status": 1,
//         "tasks.completed": 1,
//         "tasks.dateOfCompletion": 1
//       }
//     };
//     let taskCondition = {
//       "tasks.status": { $ne: 'onHold' },

//       $and: [{
//         "tasks.endDate": {
//           $ne: undefined
//         }
//       }, {
//         "tasks.endDate": {
//           $ne: null
//         }
//       }, {
//         "tasks.endDate": {
//           $ne: ''
//         }
//       }],
//       "tasks.isDeleted": false,

//     };

//     let projCondition = {
//       isDeleted: false,
//      // status: 'inprogress'
//     };
//     if (projectId) {
//       projCondition["_id"] = ObjectId(projectId);
//     }
//     if (userRole !== "admin") {
//       if (userRole === "owner") {

//         taskCondition = {
//           "tasks.status": { $ne: 'onHold' },
//           $and: [{
//             "tasks.endDate": {
//               $ne: undefined
//             }
//           }, {
//             "tasks.endDate": {
//               $ne: null
//             }
//           }, {
//             "tasks.endDate": {
//               $ne: ''
//             }
//           }],
//           $and: [
//             {
//               $or: [{
//                 userid: userId
//               }, {
//                 "tasks.userId": userId
//               }]
//             }],
//           "tasks.isDeleted": false
//         };

//       } else {
//         taskCondition = {
//           "tasks.status": { $ne: 'onHold' },
//           "tasks.userId": userId,
//           $and: [{
//             "tasks.endDate": {
//               $ne: undefined
//             }
//           }, {
//             "tasks.endDate": {
//               $ne: null
//             }
//           }, {
//             "tasks.endDate": {
//               $ne: ''
//             }
//           }],
//           "tasks.isDeleted": false,

//         };

//       }
//     }
//     let projectCond = {
//       $match: projCondition
//     };
//     let tasksUnwind = {
//       $unwind: "$tasks"
//     };
//     let taskFilterCondition = {
//       $match: taskCondition
//     };
//     let group = {
//       $group: {
//         _id: {
//           _id: '$_id',
//           title: '$title',
//           taksTitle: '$tasks.title',
//           status: '$tasks.status',
//           userId: '$tasks.userId',
//           endDate: '$tasks.endDate',
//           dateOfCompletion: '$tasks.dateOfCompletion'
//         },
//       }
//     };
//     logInfo([projectCond, projectFields, tasksUnwind, taskFilterCondition, group], "gettodaysTasksChartData")
//     Project.aggregate([projectCond, projectFields, tasksUnwind, taskFilterCondition, group])
//       .then((result) => {
//         let countArray = []
//         if (result.length > 0) {
//           let tasksByProjectId = {}
//           for (let i = 0; i < result.length; i++) {
//             if (tasksByProjectId[result[i]._id.status]) {
//               tasksByProjectId[result[i]._id.status].push(result[i]);
//             }
//             else {
//               tasksByProjectId[result[i]._id.status] = [result[i]];
//             }
//           }
//           // console.log("tasksByProjectId", tasksByProjectId)
//           let keys = Object.keys(tasksByProjectId);
//           let overDueCount = 0
//           let date = dateUtil.DateToString(new Date());
//           for (let i = 0; i < keys.length; i++) {
//             if (keys[i] === 'completed') {

//               let completed = tasksByProjectId[keys[i]].length;

//               countArray.push({ 'name': 'Completed', 'value': completed })
//             }
//             else if (keys[i] === 'inprogress') {
//               let inprogress = tasksByProjectId[keys[i]].length;
//               for (let j = 0; j < tasksByProjectId[keys[i]].length; j++) {
//                 let dbDate = dateUtil.DateToString(tasksByProjectId[keys[i]][j]._id.endDate);
//                 if (dbDate < date) {
//                   overDueCount++
//                 }
//               }
//               countArray.push({ 'name': 'Inprogress', 'value': inprogress })

//             }
//             else if (keys[i] === 'new') {
//               let todo = tasksByProjectId[keys[i]].length;
//               for (let j = 0; j < tasksByProjectId[keys[i]].length; j++) {
//                 let dbDate = dateUtil.DateToString(tasksByProjectId[keys[i]][j]._id.endDate);
//                 if (dbDate < date) {
//                   overDueCount++
//                 }
//               }
//               countArray.push({ 'name': 'Todo', 'value': todo })
//             }
//           }
//           countArray.push({ 'name': 'Overdue', 'value': overDueCount })
//         }
//         res.json({
//           // data:success
//           data: countArray
//         })
//       })
//       .catch((err) => {
//         res.json({
//           err: errors.SERVER_ERROR
//         });
//       });
//   }
//   catch (e) {
//     console.log(e)
//   }
// });



// exports.getUserProductivityData = ((req, res) => {
//   try {
//     logInfo("getUserProductivityData userInfo=");
//     logInfo(req.userInfo, "getUserProductivityData userInfo=");
//     logInfo(req.body, "getUserProductivityData");

//     let userRole = req.userInfo.userRole.toLowerCase();
//     let userId = req.userInfo.userId;

//     let condition = {};

//     let projectFields = {
//       $project: {
//         _id: 1,
//         // "tasks.title": 1,
//         "tasks._id": 1,
//         "tasks.userId": 1,
//         "tasks.startDate": 1,
//         "tasks.isDeleted": 1,
//         "tasks.storyPoint": 1,
//         "tasks.dateOfCompletion": 1
//       }
//     };
//     let unwindTasks = {
//       $unwind: "$tasks"
//     };
//     if (userId !== undefined && userId !== null && userId !== '') {
//       condition = {
//         $and: [{
//           "tasks.dateOfCompletion": {
//             $ne: undefined
//           }
//         }, {
//           "tasks.dateOfCompletion": {
//             $ne: null
//           }
//         }, {
//           "tasks.dateOfCompletion": {
//             $ne: ''
//           }
//         }
//         ],
//         $and: [{
//           "tasks.startDate": {
//             $ne: undefined
//           }
//         }, {
//           "tasks.startDate": {
//             $ne: null
//           }
//         }, {
//           "tasks.startDate": {
//             $ne: ''
//           }
//         }
//         ],
//         "tasks.userId": userId,
//         "tasks.isDeleted": false,
//       }

//     }

//     let taskFilterCondition = {
//       $match: condition
//     };
//     let projectCond = {};
//     projectCond = {
//       $match: {
//         isDeleted: false
//       }
//     };

//     logInfo([projectCond, projectFields, unwindTasks, taskFilterCondition], "getUserProductivity Data filtercondition=");
//     Project.aggregate([projectCond, projectFields, unwindTasks, taskFilterCondition])
//       .then((result) => {
//         //console.log("result data check", result);
//         let storyPoint
//         let tasksByuserId = {}
//         let yesterDayDate = dateUtil.DateToString(new Date(new Date() - 24 * 60 * 60 * 1000));
//         let currentMonth = new Date(yesterDayDate).getMonth() + 1;
//         let currentMonthYear = new Date(yesterDayDate).getFullYear();
//         let currentDate = new Date(yesterDayDate).getDate();
//         //console.log("currentDate", currentDate);
//         let lastMonthDate = dateUtil.DateToString(new Date(new Date(yesterDayDate) - 1000 * 60 * 60 * 24 * 30))
//         let lastMonth = new Date(lastMonthDate).getMonth() + 1;
//         let lastMonthYear = new Date(lastMonthDate).getFullYear();
//         let lastMonthDayDate = new Date(lastMonthDate).getDate();
//         //console.log("lastMonthDay", lastMonthDayDate);

//         Holiday.find({
//           $and: [
//             {
//               "fullDate": { "$lte": yesterDayDate }
//             },
//             {
//               "fullDate": { "$gte": lastMonthDate }
//             }
//           ],
//           "isActive": "1"
//         })
//           .then((result1) => {
//             let holidayCount = result1 && result1.length;
//             let totalSunday = totalSundays.getSundayInaMonth(lastMonthDate, yesterDayDate)
//             let totalHoliday = holidayCount + totalSunday;
//             let oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
//             let daysInMonth = Math.round(Math.abs((new Date(yesterDayDate).getTime() - new Date(lastMonthDate).getTime()) / (oneDay)));

//             let workingHours = (daysInMonth - totalHoliday) * config.minWorkingHours;

//             if (result.length > 0) {

//               for (let i = 0; i < result.length; i++) {
//                 let startDate = dateUtil.DateToString(result[i].tasks.startDate)
//                 if (startDate >= lastMonthDate || startDate <= yesterDayDate) {
//                   if (tasksByuserId[result[i].tasks.userId]) {
//                     storyPoint = tasksByuserId[result[i].tasks.userId].storyPoint + result[i].tasks.storyPoint;
//                     tasksByuserId[result[i].tasks.userId].storyPoint = storyPoint;
//                   }
//                   else {
//                     storyPoint = 0;
//                     storyPoint = storyPoint + result[i].tasks.storyPoint;
//                     tasksByuserId[result[i].tasks.userId] = { storyPoint: storyPoint, workingHours: workingHours };
//                   }
//                 }
//               }

//             }
//             let tasks = []
//             let keys = Object.keys(tasksByuserId)

//             for (let i = 0; i < keys.length; i++) {
//               let taskObj = {
//                 Storypoint: tasksByuserId[keys[i]].storyPoint,
//                 WorkingHours: tasksByuserId[keys[i]].workingHours,
//               }
//               tasks.push(taskObj)
//             }

//             logInfo("before response getUserProductivity Data  tasks=");
//             res.json({
//               success: true,
//               data: tasks
//             });
//           })


//       })
//       .catch((err) => {
//         res.json({
//           err: errors.SERVER_ERROR
//         });
//       });
//   } catch (e) {
//     logError(e, "getUserProductivity Data  error");
//   }
// })




