const express = require('express');
const router = express.Router();
var uploadglobalFileController = require('../controllers/golbal-repository-controller');
const verifyAppLevelAccess = require("../../../verify-app-level-access/verify-app-level-access");
const verifyToken = require("../../../verify-token/verify-token");

//add/upload file

router.post('/add', verifyToken, verifyAppLevelAccess, uploadglobalFileController.postUploadFile);
//get All file
router.post('/getAllFile', verifyToken, uploadglobalFileController.getAllRepositoryFile);

//get singlefile

router.get('/:fileId', verifyToken, uploadglobalFileController.getRepositoryFile);

//delete file
router.post('/delete', verifyToken, uploadglobalFileController.deleteUploadFile);

//download file

router.post('/download', verifyToken, uploadglobalFileController.downloadUploadFile);

//Edit File
router.post('/edit', verifyToken, uploadglobalFileController.editRepositoryFile);

//Add/create folder

router.post('/createFolder', verifyToken, uploadglobalFileController.createFolder);

module.exports = router;

