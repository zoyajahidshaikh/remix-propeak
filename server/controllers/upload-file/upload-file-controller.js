const mongoose = require('mongoose');
const UploadFile = require('../../models/upload-file/upload-file-model');
const uuidv4 = require("uuid/v4");
const fs = require('fs');
const path = require('path');
const config = require("../../config/config");
const audit = require('../audit-log/audit-log-controller');
const jwt = require('jsonwebtoken');
const secret = require('../../config/secret');
const User = require('../../models/user/user-model');
const Project = require('../../models/project/project-model');
const Task = require('../../models/task/task-model');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
const { logError, logInfo } = require('../../common/logger');
const TaskType = require('../../models/task/task-type-model');
const access = require('../../check-entitlements');
let uploadFolder = config.UPLOAD_PATH +'/uploads';

const errors = {
    "NOT_AUTHORIZED": "Your are not authorized"
}

exports.uploadFileGetByProjectId = ((req, res) => {
    let userRole = req.userInfo.userRole.toLowerCase();
    let accessCheck = access.checkEntitlementsForUserRole(userRole);
    if (accessCheck === false) {
        res.json({ err: errors.NOT_AUTHORIZED });
        return;
    }
    if (req.params.taskId !== 'undefined') {
        Project.aggregate([{ $match: { _id: mongoose.Types.ObjectId(req.params.projectId) } },
        { $project: { "tasks._id": 1, "tasks.uploadFiles": 1 } }, { $unwind: "$tasks" },
        { $match: { 'tasks._id': mongoose.Types.ObjectId(req.params.taskId) } }])
            .then((result) => {
                let uploadFileResult = result[0].tasks.uploadFiles.filter((m) => {
                    if (m.isDeleted !== true) {
                        return m
                    }
                })
                res.json(uploadFileResult);
            })
            .catch((err) => {
                res.json({ err: errors.MESSAGE_DOESNT_EXIST });
            });
    }
    else {
        Project.aggregate([{
            $match: {
                _id: mongoose.Types.ObjectId(req.params.projectId),
                $or: [{ isDeleted: false }, { isDeleted: null }]
            }
        }, { $unwind: "$uploadFiles" },
        { $match: { $or: [{ "uploadFiles.isDeleted": false }, { "uploadFiles.isDeleted": null }] } },
        { $project: { "uploadFiles": 1 } }])
            .then((result) => {
                let uploadFiles = [];
                result.map((r) => {
                    uploadFiles.push(r.uploadFiles);
                })
                res.json(uploadFiles);
            })
            .catch((err) => {
                res.status(500).json({ success: false, msg: `Something went wrong. ${err}` });
            });
    }
})

exports.tasksFileUpload = ((req, res) => {
    let userRole = req.userInfo.userRole.toLowerCase();
    let accessCheck = access.checkEntitlements(userRole);
    let userAccess = req.userInfo.userAccess;
    viewtasksUpload = accessConfig.validateEntitlements(userAccess, req.body.projectId, 'Upload Tasks', 'view',userRole);
    if (accessCheck === false && !viewtasksUpload) {
        res.json({ err: errors.NOT_AUTHORIZED });
        return;
    }
    logInfo("tasksFileUpload before response", req.body);

    var taskTypes = [];
    TaskType.find({})
        .then((result) => {
            result.map((r) => {
                taskTypes.push(r.title);
            })
        })

    if (!req.files.tasksFile) {

        res.send({ "error": "No files were uploaded." });
        return;
    }

    var projectId = req.body.projectId;
    var uploadedFile = req.files.tasksFile;
    let fileUploaded = uploadedFile.name.split('.');
    let fileExtn = fileUploaded[fileUploaded.length - 1].toUpperCase();
    let validFileExtn = ['XLS', 'XLSX'];
    let isValidFileExtn = validFileExtn.filter((extn) => extn === fileExtn);
    if (isValidFileExtn.length > 0) {

        if (fs.existsSync(uploadFolder + "/" + projectId)) {

            uploadedFile.mv(uploadFolder + "/" + projectId + "/" + req.body.filename, function (err) {
                if (err) {
                    res.send({ "error": "File Not Saved." });
                } else {
                    parseFile(uploadFolder, projectId, req.body.filename)
                }
            });
        } else {
            fs.mkdir(uploadFolder + '/' + projectId, function (err) {
                if (err) {
                    return console.error(err);
                }
                uploadedFile.mv(uploadFolder + "/" + projectId + "/" + req.body.filename, function (err) {
                    if (err) {
                        res.send({ "error": "File Not Saved." });
                    } else {
                        parseFile(uploadFolder, projectId, req.body.filename)
                    }
                });
            });
        }


    } else {
        res.send({ "error": "File format not supported!(Formats supported are: 'XLSX', 'XLS')" });
    }

    parseFile = (uploadFolder, projectId, filename) => {
        var exceltojson;

        if (filename.split('.')[filename.split('.').length - 1] === 'xlsx') {
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }

        try {
            exceltojson({
                input: uploadFolder + '/' + projectId + '/' + filename,
                output: null, //since we don't need output.json
                lowerCaseHeaders: true
            }, function (err, result) {
                if (err) {
                    return res.json({ error_code: 1, err_desc: err, data: null });
                }

                let mapArray = {
                    '': '',
                    'user name': 'userId',
                    'title': 'title',
                    'story point': 'storyPoint',
                    'description': 'description',
                    'start date': 'startDate',
                    'end date': 'endDate',
                    'tag': 'tag',
                    'task type': 'taskType'
                };
                let tasks = [];
                let mapArrayFields = Object.keys(mapArray);

                for (let i = 0; i < result.length; i++) {
                    let task = {};
                    for (field in result[i]) {
                        let invalidField = mapArrayFields.filter((m) => {
                            return m === field;
                        })
                        if (invalidField.length === 0) {
                            task = {};
                        } else {
                            task[mapArray[field]] = result[i][field];
                        }

                    }
                    task.status = 'new';
                    task.category = 'todo';
                    task.completed = false;
                    task.depId = '';
                    task.isDeleted = false;
                    task.createdOn = new Date().toISOString();
                    task.modifiedOn = new Date().toISOString();
                    task.createdBy = req.userInfo.userId;
                    task.modifiedBy = req.userInfo.userId;
                    task.sequence = '';
                    if (!task.taskType) {
                        task.taskType = "task";
                    } else {
                        task.taskType = task.taskType.toLowerCase();
                    }

                    if (!task.startDate) task.startDate = "";
                    if (!task.endDate) task.endDate = "";
                    if (!task.userId) task.userId = "";
                    if (!task.tag) task.tag = "";
                    if (task.title && task.description && task.storyPoint && task.taskType && task.status) {
                        tasks.push(task);
                    }
                }
                if (tasks.length > 0) {
                    Project.findById(req.body.projectId)
                        .then((res1) => {
                            tasks.map((t) => {
                                if (t.userId !== undefined && t.userId !== null && t.userId !== '') {
                                    let user = res1.projectUsers.filter((p) => {
                                        return p.name === t.userId;
                                    });
                                    t.userId = user && user.length > 0 ? user[0].userId : '';
                                }
                                if (t.taskType !== undefined && t.taskType !== null && t.taskType !== '') {

                                    let isTaskType = taskTypes.filter((taskT) => {
                                        return t.taskType === taskT;
                                    });

                                    if (isTaskType.length === 0) t.taskType = "task";
                                }
                                if (t.startDate !== undefined && t.startDate !== null && t.endDate !== undefined && t.endDate !== null) {

                                    var date = t.startDate;
                                    var newdate = date.split("-").reverse().join("-");

                                    var date1 = t.endDate;
                                    var newdate1 = date1.split("-").reverse().join("-");
                                    t.startDate = newdate;
                                    t.endDate = newdate1;
                                }
                                res1.tasks.push(t);
                            })

                            res1.save()
                                .then((res3) => {
                                    logInfo(res3, "parseFile result ");
                                    res.json({ error_code: 0, err_desc: null, msg: 'Tasks added successfully' });
                                })
                                .catch((err) => {
                                    logInfo(err, "tasksFileUpload tasks not added error ");
                                })
                        })
                }
                else {
                    res.json({
                        "error": 'Uploaded file is not in correct format'
                    })
                }

            });
        } catch (e) {
            logInfo(e, "parseFile error ");
            res.json({ error_code: 1, err_desc: "Corrupted excel file" });
        }
    }
});

exports.postUploadFile = ((req, res) => {
    let userRole = req.userInfo.userRole.toLowerCase();
    let accessCheck = access.checkEntitlementsForUserRole(userRole);
    if (accessCheck === false) {
        res.json({ err: errors.NOT_AUTHORIZED });
        return;
    }
    let UploadFile = {
        _id: req.body._id,
        taskId: req.body.taskId,
        filename: req.body.filename,
        isDeleted: false,
        createdBy: req.userInfo.userId,
        createdOn: new Date(),
    }
    if (req.body.taskId !== 'undefined') {
        Project.findOneAndUpdate({ "_id": req.body.projectId, "tasks._id": req.body.taskId }, { $push: { 'tasks.$.uploadFiles': UploadFile } })
            .then((result) => {
                res.json({
                    success: true,
                    msg: `Successfully Updated!`,
                    result: UploadFile
                })
            })
    }
    else {
        Project.findOneAndUpdate({ _id: req.body.projectId }, { $push: { uploadFiles: UploadFile } })
            .then((oldResult) => {
                Project.findOne({ _id: req.body.projectId })
                    .then((newResult) => {
                        let userIdToken = req.userInfo.userName;
                        let field = 'uploadFiles';
                        audit.insertAuditLog('', newResult.title, 'Project', field, UploadFile.filename, userIdToken, newResult._id);
                        res.json({ newFile: UploadFile });
                    })
            })
    }

    try {
        if (!req.files.uploadFile) {
            res.send({ "error": "No files were uploaded." });
            return;
        }
        var projectId = req.body.projectId;
        var taskId = req.body.taskId;
        var filename = req.body.filename;
        var uploadedFile = req.files.uploadFile;
        let fileUploaded = uploadedFile.name.split('.');
        let fileExtn = fileUploaded[fileUploaded.length - 1].toUpperCase();

        let validFileExtn = ['PDF', 'DOCX', 'PNG', 'JPEG', 'JPG', 'TXT', 'PPT', 'XLSX', 'XLS', 'PPTX'];
        let isValidFileExtn = validFileExtn.filter((extn) => extn === fileExtn);
        if (isValidFileExtn.length > 0) {
            if (fs.existsSync(uploadFolder + "/" + projectId)) {

                if (taskId === 'undefined') {
                    uploadedFile.mv(uploadFolder + "/" + projectId + "/" + filename, function (err) {

                        if (err) {
                            console.log(err);
                            res.send({ "error": "File Not Saved." });
                        }
                    });
                } else if (fs.existsSync(uploadFolder + "/" + projectId + "/" + taskId)) {

                    uploadedFile.mv(uploadFolder + "/" + projectId + "/" + taskId + "/" + filename, function (err) {
                        if (err) {
                            console.log(err);
                            res.send({ "error": "File Not Saved." });
                        }
                    });


                } else {
                    fs.mkdir(uploadFolder + '/' + projectId + '/' + taskId, function (err) {
                        if (err) {
                            return console.error(err);
                        }
                        uploadedFile.mv(uploadFolder + "/" + projectId + "/" + taskId + "/" + filename, function (err) {
                            if (err) {
                                res.send({ "error": "File Not Saved." });
                            }
                        });

                    });

                }

            } else {
                fs.mkdir(uploadFolder + '/' + projectId, function (err) {
                    if (err) {
                        return console.error(err);
                    }
                    if (taskId !== 'undefined') {
                        fs.mkdir(uploadFolder + '/' + projectId + '/' + taskId, function (err) {
                            if (err) {
                                return console.error(err);
                            }
                            uploadedFile.mv(uploadFolder + "/" + projectId + "/" + taskId + "/" + filename, function (err) {
                                if (err) {
                                    res.send({ "error": "File Not Saved." });
                                }
                            });
                        })
                    } else {
                        uploadedFile.mv(uploadFolder + "/" + projectId + "/" + filename, function (err) {
                            if (err) {
                                res.send({ "error": "File Not Saved." });
                            }
                        });
                    }

                });
            }

        } else {
            res.send({ "error": "File format not supported!(Formats supported are: 'PDF', 'DOCX', 'PNG', 'JPEG', 'JPG', 'TXT', 'PPT', 'XLSX', 'XLS','PPTX')" });
        }
    }
    catch (err) {
        console.log(err);
    }
})

exports.deleteUploadFile = ((req, res) => {
    let userRole = req.userInfo.userRole.toLowerCase();
    let accessCheck = access.checkEntitlementsForUserRole(userRole);
    if (accessCheck === false) {
        res.json({ err: errors.NOT_AUTHORIZED });
        return;
    }
    var data = req.body;
    if (!data.filename) {
        res.send({ "error": "No files were uploaded." });
        return;
    }
    if (data.taskId === undefined) {
        var fileToBeDeleted = uploadFolder + "/" + data.projectId + "/" + data.filename;

        try {
            fs.unlink(fileToBeDeleted, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    // console.log(data.filename + " deleted sucessfully");
                }
            });
        } catch (e) {
            console.log(e);
        }
    } else {
        var fileToBeDeleted = uploadFolder + "/" + data.projectId + "/" + data.taskId + "/" + data.filename;

        try {
            fs.unlink(fileToBeDeleted, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    // console.log(data.filename + " deleted sucessfully");
                }
            });
        } catch (e) {
            console.log(e);
        }
    }
    if (req.body.taskId !== undefined) {
        Project.findById(req.body.projectId)
            .then((result) => {
                let task = result.tasks.id(req.body.taskId)
                let taskupload = task.uploadFiles.id(req.body.updatedFile._id);
                taskupload.isDeleted = req.body.updatedFile.isDeleted;
                return result.save();
            })
            .then((result) => {
                res.send({ result });
            })
    } else {
        Project.findOneAndUpdate({ _id: req.body.projectId, 'uploadFiles._id': req.body.updatedFile._id }, { $set: { 'uploadFiles.$': req.body.updatedFile } }, { "new": true })
            .then((result) => {
                let userIdToken = req.userInfo.userName;
                let field = 'uploadFiles';
                audit.insertAuditLog(req.body.updatedFile.filename, result.title, 'Project', field, '', userIdToken, result._id);
                res.json(result.uploadFiles);
            })
    }
})

exports.downloadUploadFile = ((req, res) => { // this routes all types of file
    let userRole = req.userInfo.userRole.toLowerCase();
    let accessCheck = access.checkEntitlementsForUserRole(userRole);
    if (accessCheck === false) {
        res.json({ err: errors.NOT_AUTHORIZED });
        return;
    }
    var data = req.params;
    if (data.taskId === 'undefined') {
        var abpath = path.join(uploadFolder + "/" + data.projectId + "/", data.filename);
    } else {
        var abpath = path.join(uploadFolder + "/" + data.projectId + "/" + data.taskId + "/", data.filename);
    }

    res.download(abpath, (err) => {
        if (err) {
            console.log(err);
        }
    })

});

