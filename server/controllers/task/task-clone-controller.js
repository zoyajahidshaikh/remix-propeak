const mongoose = require('mongoose');
const Task = require('../../models/task/task-model');
const SubTask = require('../../models/sub-task/subtask-model');
const uuidv4 = require('uuid/v4');
const nodemailer = require('nodemailer');
const User = require('../../models/user/user-model');
const audit = require('../audit-log/audit-log-controller');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const secret = require('../../config/secret');
const config = require("../../config/config");
const Project = require('../../models/project/project-model');
const { logError, logInfo } = require('../../common/logger');
const errors = {
  TASK_DOESNT_EXIST: 'Task does not exist',
  ADD_CLONE_TASK_ERROR: 'Error occurred while adding the  Clone Task',
};
const objectId = require('../../common/common');

exports.taskClone = ((req, res) => {
  logInfo(req.body, "taskClone");
  // console.log("in");
  Project.findById(req.body.projectId)
    .then((result) => {
      var task = result.tasks.id(req.body.taskId)
      let subtasks = task.subtasks.filter((s) => {
        return s.isDeleted === false;
      })
      let cloneSubTasks = subtasks.map((s) => {
        let subTask = {
          title: s.title,
          completed: false,
          edit: false,
          dateOfCompletion: '',
          isDeleted: false
        }
        return subTask;
      })
  
      let taskId = objectId.mongoObjectId();
     var newTask = {
       _id: taskId,
        userId: task.userId,
        title: 'Clone of ' + task.title,
        description: task.description,
        completed: false,
        category: 'todo',
        tag: task.tag,
        status: 'new',
        storyPoint: task.storyPoint,
        startDate: task.startDate,
        endDate: task.endDate,
        depId: '',
        taskType: task.taskType,
        priority:task.priority,
        createdOn: new Date(),
        createdBy: req.userInfo.userId,
        modifiedOn: new Date(),
        modifiedBy: req.userInfo.userId,
        isDeleted: false,
        sequence: result.tasks.length + 1,
        subtasks: cloneSubTasks,
        messages: [],
        uploadFiles: []
      }

    result.tasks.push(newTask);
      result.save()
    .then((res1) => {
      let userIdToken = req.userInfo.userName;
      let field = 'Task Clone';
      audit.insertAuditLog(task.title, newTask.title, 'Task', field, newTask.title, userIdToken, req.body.projectId);
      res.json(newTask);
    }) 
  })
  .catch((err) => {
    // Show failed if all else fails for some reasons
    res.json({
      err: err
    });
  });
});



