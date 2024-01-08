const mongoose = require('mongoose');
const uuidv4 = require("uuid/v4");
const jwt = require('jsonwebtoken');
const secret = require('../../config/secret');
const audit = require('../audit-log/audit-log-controller');
const Project = require('../../models/project/project-model');
const { logError, logInfo } = require('../../common/logger');

const errors = {
  SUBTASK_DOESNT_EXIST: 'SubTask does not exist',
  ADD_SUBTASK_ERROR: 'Error occurred while adding the SubTask',
  EDIT_SUBTASK_ERROR: 'Error occurred while updating the SubTask',
  DELETE_SUBTASK_ERROR: 'Error occurred while deleting the SubTask',
};

exports.getAllsubTasks = ((req, res) => {
  logInfo("getAllsubTasks");
  Project.aggregate([{
    $match: {
      _id: mongoose.Types.ObjectId(projectId),
      $or: [{ isDeleted: false }, { isDeleted: null }]
    }
  }
    , { $unwind: "$tasks" },
  { $match: { $or: [{ "tasks.isDeleted": false }, { "tasks.isDeleted": null }] } },
  { $project: { "tasks.subtasks": 1 } }
  ])
    .then((result) => {
      let subTaskresult = result[0].tasks.subtasks.filter((m) => {
        if (m.isDeleted !== true) {
          return m;
        }

      })
      logInfo("getAllsubTasks before response");
      res.json(subTaskresult);
    })
    .catch((err) => {
      res.json({ err: errors.MESSAGE_DOESNT_EXIST });
    });
})

exports.createSubTask = ((req, res) => {
  logInfo(req.body, "createSubTask req.body");
  try {
    let taskTitle = req.body.taskTitle;
    let newSubTask = {
      _id: req.body.subTask._id,
      taskId: req.body.subTask.taskId,
      title: req.body.subTask.title,
      completed: req.body.subTask.completed,
      edit: req.body.subTask.edit,
      dateOfCompletion: req.body.subTask.dateOfCompletion,
      isDeleted: req.body.subTask.isDeleted,
      hiddenUsrId: req.body.subTask.hiddenUsrId,
      storyPoint: req.body.subTask.storyPoint,
      subtaskHiddenDepId: req.body.subTask.subtaskHiddenDepId,
      sequence: req.body.subTask.sequence
    };
    Project.findOneAndUpdate({ "_id": req.params.projectId, "tasks._id": req.body.subTask.taskId }, { $push: { 'tasks.$.subtasks': newSubTask } })
      .then((result) => {
        logInfo(result, "createSubTask result");
        let userIdToken = req.userInfo.userName;
        let fields = [];
        var res1 = Object.assign({}, newSubTask);

        for (let keys in res1) {
          if (keys !== '_id' && keys !== 'taskId') {
            fields.push(keys);
          }
        }

        fields.filter((field) => {
          if (newSubTask[field] !== undefined && newSubTask[field] !== null && newSubTask[field] !== '') {
            audit.insertAuditLog('', newSubTask.title, 'Subtask', field, newSubTask[field], userIdToken, result._id);
          }
        })

        res.json({
          success: true,
          msg: `Successfully added!`,
          result: newSubTask
        })
      })
      .catch((err) => {
        res.json({ err: errors.ADD_SUBTASK_ERROR });

      });
  }
  catch (e) {
    // console.log("err", e);
  }
})

exports.updateSubTask = ((req, res) => {
  // console.log("req.body", req.body);
  logInfo(req.body, "updateSubTask");
  let projectId = req.body.projectId;
  let taskId = req.body.taskId;
  let subTask = req.body.subTask;
  let updatedSubTask = {
    _id: subTask._id,
    title: subTask.title,
    completed: subTask.completed,
    edit: subTask.edit,
    dateOfCompletion: subTask.dateOfCompletion,
    isDeleted: subTask.isDeleted,
    hiddenUsrId: subTask.hiddenUsrId,
    storyPoint: subTask.storyPoint,
    subtaskHiddenDepId: subTask.subtaskHiddenDepId,
    sequence: subTask.sequence
  };
  // console.log("updatedSubTask", updatedSubTask);
  Project.findById(projectId)
    .then((result) => {

      let task = result.tasks.id(taskId)
      let subtask = task.subtasks.id(updatedSubTask._id);
      let userIdToken = req.userInfo.userName;
      let fields = [];
      var res1 = Object.assign({}, updatedSubTask);

      for (let keys in res1) {
        if (keys !== '_id') {
          fields.push(keys);
        }
      }

      fields.filter((field) => {
        if (subtask[field] !== updatedSubTask[field]) {
          if (updatedSubTask[field] !== undefined && updatedSubTask[field] !== null && updatedSubTask[field] !== '') {
            audit.insertAuditLog(subtask[field], updatedSubTask.title, 'Subtask', field, updatedSubTask[field], userIdToken, result._id);
          }
        }
      })

      if (updatedSubTask.isDeleted === true) {
        subtask.isDeleted = updatedSubTask.isDeleted;
      }
      else if (updatedSubTask.completed === true) {
        subtask.completed = updatedSubTask.completed;
      }
      else {
        subtask.title = updatedSubTask.title,
          subtask.hiddenUsrId = subTask.hiddenUsrId,
          subtask.storyPoint = subTask.storyPoint
      }
      subtask = updatedSubTask;
      return result.save();
    })
    .then((result) => {
      // console.log("updateSubTask result", result);
      logInfo("updateSubTask before reposne");
      res.send({ result });
    })
    .catch((err) => {
      logInfo("updateSubTask error " + err);
      res.json({ err: errors.EDIT_SUBTASK_ERROR });
    });
})

exports.updateSubTaskCompleted = ((req, res) => {
  logInfo(req.body, "updateSubTaskCompleted req.body");
  let updatedSubTask = {
    _id: req.body.subTask._id,
    taskId: req.body.subTask.taskId,
    title: req.body.subTask.title,
    completed: req.body.subTask.completed,
    edit: req.body.subTask.edit,
    dateOfCompletion: req.body.subTask.dateOfCompletion,
    isDeleted: req.body.subTask.isDeleted,
    sequence: req.body.subTask.sequence
  };

  Project.findById(req.body.projectId)
    .then((result) => {
      let task = result.tasks.id(req.body.taskId)
      let subtask = task.subtasks.id(updatedSubTask._id);
      subtask.completed = updatedSubTask.completed;
      return result.save();
    })
    .then((result) => {
      logInfo(result, "updateSubTaskCompleted result");
      res.send({ result });
    })
    .catch((err) => {
      res.json({ err: errors.EDIT_SUBTASK_ERROR });
      return;
    });
})