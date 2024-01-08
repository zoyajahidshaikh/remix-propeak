const express = require('express');
const router = express.Router();
const verifyToken = require("../../verify-token/verify-token");

var subTaskController = require('../../controllers/sub-task/subtask-controller');

router.get('/:projectId',verifyToken, subTaskController.getAllsubTasks);

// CREATE
router.post('/create/:projectId',verifyToken, subTaskController.createSubTask);

// UPDATE
router.post('/update',verifyToken, subTaskController.updateSubTask);

router.post('/subtaskComplete/', subTaskController.updateSubTaskCompleted);


module.exports = router;

