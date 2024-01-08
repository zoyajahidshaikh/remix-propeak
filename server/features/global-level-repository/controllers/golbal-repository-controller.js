const mongoose = require('mongoose');
const UploadRepositoryFile = require('../../../models/global-level-repository/global-level-repository-model');
const fs = require('fs');
const path = require('path');
const config = require("../../../config/config");
const { logError, logInfo } = require('../../../common/logger');
const access = require('../../../check-entitlements');
let uploadFolder = config.UPLOAD_PATH + '/uploads/documents';
// let uploadFolder = './uploads';


exports.getRepositoryFile = ((req, res) => {
    let id = req.params.fileId
    UploadRepositoryFile.find({ _id: id })
        .then((result) => {
            res.json({
                result
            })
        })
})

exports.getAllRepositoryFile = ((req, res) => {
    let pathName = ''
    if (req.body.pathData === 'root') {
        pathName = '/'
    }
    else {
        pathName = req.body.pathData.toLowerCase()
    }
    let itemArray = []

    UploadRepositoryFile.find({
        'path': pathName,
        isDeleted: false

    })
        .then((result) => {
            let folderPath= ''
            if (req.body.pathData === 'root') {
                folderPath= uploadFolder 
            }
            else {
                folderPath= uploadFolder + pathName
            }

           
            // getDirs = (a_path) => {
            //     console.log("getDirs a_path = "+a_path);
                let dirs = fs.readdirSync(folderPath);
            
                for(let x = 0; x<dirs.length; x++){
                    let a_dir = path.resolve(folderPath, dirs[x]);
                    //console.log(dirs[x]);
                    if(fs.statSync(a_dir).isDirectory()){
                         itemArray.push('/' + dirs[x])
                    }
                    
                }
            //     return dirs;
            // };
            // fs.readdir(folderPath, { withFileTypes: true }, function (err, items) {
            //     console.log("items",items);
                
                // for (var i = 0; i < items.length; i++) {
                //     if (items[i].name.indexOf('.') > -1) {
                //         //itemArray.push('/')
                //     }
                //     else {
                //         itemArray.push('/' + items[i].name)
                //     }
                // }
                let dataArray = [];
                let k = true;
                for (let j = 0; j < itemArray.length; j++) {
                    let name = itemArray[j].split('/');
                    let pathDt = '';
                    if (pathName === '/') {
                        pathDt = itemArray[j];
                    }
                    else {
                        pathDt = pathName + itemArray[j];
                    }

                    let obj = {
                        "title": name[1],
                        "path": pathDt,
                    }

                    dataArray.push(obj);

                }
                for (let i = 0; i < result.length; i++) {

                    let obj = {
                        "_id": result[i]._id,
                        "title": result[i].title,
                        "fileName": result[i].fileName,
                        "description": result[i].description,
                        "path": result[i].path,
                        "isDeleted": result[i].isDeleted,
                        "createdBy": result[i].createdBy,
                        "createdOn": result[i].createdOn
                    }

                    dataArray.push(obj)

                }

                res.json({
                    result: dataArray
                })

            // });

        })
})


exports.postUploadFile = ((req, res) => {
    let userRole = req.userInfo.userRole.toLowerCase();
    let accessCheck = access.checkEntitlementsForUserRole(userRole);
    if (accessCheck === false) {
        res.json({ err: errors.NOT_AUTHORIZED });
        return;
    }
    let pathName;
    if (req.body.path === 'root') {
        pathName = '/'
    }
    else {
        if (req.body.path.charAt(0) === '/') {
            pathName = req.body.path
        }
        else {
            pathName = '/' + req.body.path
        }
    }
    let uploadFile = new UploadRepositoryFile({
        _id: req.body._id,
        title: req.body.title,
        fileName: req.body.fileName,
        description: req.body.description,
        path: pathName,
        isDeleted: false,
        createdBy: req.userInfo.userId,
        createdOn: req.body.createdOn,
    })



    try {
        if (!req.files.uploadFile) {
            res.send({ "error": "No files were uploaded." });
            return;
        }
        var filename = req.body.fileName;
        var uploadedFile = req.files.uploadFile;
        let fileUploaded = uploadedFile.name.split('.');
        let fileExtn = fileUploaded[fileUploaded.length - 1].toUpperCase();

        let validFileExtn = config.extentionFile;
        let isValidFileExtn = validFileExtn.filter((extn) => extn === fileExtn);

        function ensureDirectoryExistence(filePath) {
            var dirname = path.dirname(filePath);
            if (fs.existsSync(dirname)) {
                return true;
            }
            ensureDirectoryExistence(dirname);
            fs.mkdirSync(dirname);
        }
        if (isValidFileExtn.length > 0) {
            uploadFile.save()
            .then((result) => {
                res.json({
                    success: true,
                    msg: `Document Added Successfully !`,
                    result: req.body
                })
            })
            if (pathName === '/') {
                uploadedFile.mv(uploadFolder + "/" + filename, function (err) {
                    if (err) {
                        console.log(err);
                        res.send({ "error": "File Not Saved." });
                    }
                });
            }
            else {

                ensureDirectoryExistence('uploads/documents' + pathName + "/" + filename);

                uploadedFile.mv(uploadFolder + pathName + "/" + filename, function (err) {
                    if (err) {
                        res.send({ "error": "File Not Saved." });
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

exports.editRepositoryFile = ((req, res) => {
    //console.log("req.body", req.body);
    let userRole = req.userInfo.userRole.toLowerCase();
    let accessCheck = access.checkEntitlementsForUserRole(userRole);
    if (accessCheck === false) {
        res.json({ err: errors.NOT_AUTHORIZED });
        return;
    }
    let pathName;
    if (req.body.path === '/') {
        pathName = '/'
    }
    else {
        pathName = req.body.path
    }
    let updatedFile = {
        _id: req.body._id,
        title: req.body.title,
        fileName: req.body.fileName,
        description: req.body.description,
        path: pathName,
        isDeleted: false,
        createdBy: req.userInfo.userId,
        createdOn: req.body.createdOn,
    }

    UploadRepositoryFile.findOneAndUpdate({ "_id": req.body._id }, updatedFile)
        .then((result) => {
            //console.log("result", result);
            res.json({
                success: true,
                msg: `Document Updated Successfully!`,
                result: req.body
            })
        })

    // try {
    //     if (!req.files.uploadFile) {
    //         res.send({ "error": "No files were uploaded." });
    //         return;
    //     }
    //     if (req.files.uploadFile !== undefined || req.files.uploadFile !==  null || req.files.uploadFile !== '') {
    //         var filename = req.body.fileName;
    //         var uploadedFile = req.files.uploadFile;
    //         let fileUploaded = uploadedFile.name.split('.');
    //         let fileExtn = fileUploaded[fileUploaded.length - 1].toUpperCase();

    //         let validFileExtn = ['PDF', 'DOCX', 'PNG', 'JPEG', 'JPG', 'TXT', 'PPT', 'XLSX', 'XLS', 'PPTX'];
    //         let isValidFileExtn = validFileExtn.filter((extn) => extn === fileExtn);
    //         function ensureDirectoryExistence(filePath) {
    //             var dirname = path.dirname(filePath);
    //             if (fs.existsSync(dirname)) {
    //                 return true;
    //             }
    //             ensureDirectoryExistence(dirname);
    //             fs.mkdirSync(dirname);
    //         }
    //         if (isValidFileExtn.length > 0) {
    //             if (pathName === '/') {
    //                 uploadedFile.mv(uploadFolder + "/" + filename, function (err) {
    //                     if (err) {
    //                         console.log(err);
    //                         res.send({ "error": "File Not Saved." });
    //                     }
    //                 });
    //             }
    //             else {
    //                 ensureDirectoryExistence('uploads/documents' + pathName + "/" + filename);

    //                 uploadedFile.mv(uploadFolder + pathName + "/" + filename, function (err) {
    //                     if (err) {
    //                         res.send({ "error": "File Not Saved." });
    //                     }
    //                 });

    //             }

    //         } else {
    //             res.send({ "error": "File format not supported!(Formats supported are: 'PDF', 'DOCX', 'PNG', 'JPEG', 'JPG', 'TXT', 'PPT', 'XLSX', 'XLS','PPTX')" });
    //         }

    //     }
    //       }
    // catch (err) {
    //     console.log(err);
    // }
})




exports.deleteUploadFile = ((req, res) => {
    let userRole = req.userInfo.userRole.toLowerCase();
    let accessCheck = access.checkEntitlementsForUserRole(userRole);
    if (accessCheck === false) {
        res.json({ err: errors.NOT_AUTHORIZED });
        return;
    }
    let data = req.body.updatedFile;
    if (!data.fileName) {
        res.send({ "error": "No files were uploaded." });
        return;
    }
    if (data.path === '/') {
        let fileToBeDeleted = uploadFolder + "/" + data.fileName;

        try {
            fs.unlink(fileToBeDeleted, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    //console.log(data.fileName + " deleted sucessfully");
                }
            });
        } catch (e) {
            console.log(e);
        }
    } else {
        let fileToBeDeleted = uploadFolder + data.path + "/" + data.fileName;

        try {
            fs.unlink(fileToBeDeleted, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    //console.log(data.fileName + " deleted sucessfully");
                }
            });
        } catch (e) {
            console.log(e);
        }

    }

    UploadRepositoryFile.findOneAndUpdate({ "_id": req.body.updatedFile._id }, { $set: { 'isDeleted': req.body.updatedFile.isDeleted } })
        .then((result) => {

            res.json(
                { msg: `Successfully Deleted!`, }
            );
        })

})


exports.downloadUploadFile = ((req, res) => { // this routes all types of file
    let userRole = req.userInfo.userRole.toLowerCase();
    let accessCheck = access.checkEntitlementsForUserRole(userRole);
    if (accessCheck === false) {
        res.json({ err: errors.NOT_AUTHORIZED });
        return;
    }
    var data = req.body;
    if (data.path === '/') {
        var abpath = path.join(uploadFolder + "/", data.filename);
    }
    else {
        var abpath = path.join(uploadFolder + data.path + "/", data.filename);
    }

    res.download(abpath, (err) => {
        if (err) {
            console.log(err);
        }
    })

});



exports.createFolder = ((req, res) => { // this routes all types of file
    let userRole = req.userInfo.userRole.toLowerCase();
    let accessCheck = access.checkEntitlementsForUserRole(userRole);
    if (accessCheck === false) {
        res.json({ err: errors.NOT_AUTHORIZED });
        return;
    }
    let pathName = '/' + req.body.folderPath.toLowerCase()

    let folderPath = uploadFolder + pathName;
   
        let folder = {
            path: pathName
        }
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
        res.json(
            {
                msg: `Successfully Created!`,
                folder
            }
        );
    }
    // else {
    //     res.json(
    //         {
    //             msg: `Already Exist`
    //         }
    //     ); 
    // }
  
   

});
