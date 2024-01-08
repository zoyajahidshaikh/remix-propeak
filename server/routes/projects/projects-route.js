const express = require('express');
const router = express.Router();
const verifyToken = require("../../verify-token/verify-token");
const verifyAppLevelAccess = require("../../verify-app-level-access/verify-app-level-access");
var projectController = require('../../controllers/project/project-controller');
const restrictCreation=require("../../common/restrict-creations");
// const config = require("../config/config");
const checkRole = require("../../verify-token/check-role");

router.post('/summary', verifyToken, checkRole, projectController.getAllProjectsSummary);

router.get('/statusOptions', verifyToken, projectController.getStatusOptions);

router.get('/data/:projectId', verifyToken, projectController.getProjectByProjectId);

//get project with task
router.get('/tasks/data/:projectId', verifyToken, projectController.getProjectDataByProjectId);

// READ (ALL)
router.get('/:projectId', verifyToken, projectController.getTasksAndUsers);

// CREATE
router.post('/addProject', verifyToken, verifyAppLevelAccess, restrictCreation,projectController.createProject);

// UPDATE
router.post('/editProject', verifyToken, verifyAppLevelAccess, projectController.updateProject);

// DELETE
router.post('/deleteProject', verifyToken, verifyAppLevelAccess, projectController.deleteProject);

router.post('/updateField', verifyToken, projectController.updateProjectField);

//Category order update
router.post('/updateCategory', verifyToken, projectController.updateProjectCategory);

//Get AuditLog
router.post('/AuditLog', verifyToken, checkRole,verifyAppLevelAccess, projectController.getAuditLog);

router.post('/getData', verifyToken, projectController.getProjectData);

router.post('/addProjectUsers', verifyToken, projectController.addProjectUsers);

router.post('/getUserProject', verifyToken, projectController.getUserProject);


// archiveProject
router.post('/archiveProject', verifyToken, verifyAppLevelAccess, projectController.archiveProject);




module.exports = router;
