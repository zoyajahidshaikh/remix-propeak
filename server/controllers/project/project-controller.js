const mongoose = require('mongoose');
const Project = require('../../models/project/project-model');
const User = require('../../models/user/user-model');
const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');
const secret = require('../../config/secret');
const audit = require('../audit-log/audit-log-controller');
const AuditLogs = require('../../models/auditlog/audit-log-model');
const ProjectStatus = require('../../models/project/project-status-model');

const { fromPromise } = require("rxjs/observable/fromPromise");
const { forkJoin } = require("rxjs/observable/forkJoin");
const { ObjectId } = require('mongodb');
const {
  logError,
  logInfo
} = require('../../common/logger');
const FavoriteProject = require('../../models/project/favorite-project-model');
const accessConfig = require('../../common/validate-entitlements');
const access = require('../../check-entitlements');
const sortData = require('../../common/common');
const errors = {
  PROJECT_DOESNT_EXIST: 'Project does not exist',
  ADD_PROJECT_ERROR: 'Error occurred while adding the project',
  EDIT_PROJECT_ERROR: 'Error occurred while updating the project',
  DELETE_PROJECT_ERROR: 'Error occurred while deleting the project',
  SEARCH_PARAM_MISSING: "Please input required parameters for search",
  SERVER_ERROR: "Opps, something went wrong. Please try again.",
  NOT_AUTHORIZED: "Your are not authorized"
};

exports.getAuditLog = (req, res) => {
  let userRole = req.userInfo.userRole.toLowerCase();
  let accessCheck = access.checkEntitlements(userRole);
  let userAccess = req.userInfo.userAccess;
  viewAuditLog = accessConfig.validateEntitlements(userAccess, req.body.id, 'Audit Report', 'view',userRole);
  if (accessCheck === false && !viewAuditLog) {
    res.json({ err: errors.NOT_AUTHORIZED });
    return;
  }
  try {
    let auditObservable = fromPromise(
      AuditLogs.find({
        projectId: req.body.id
      }));
    let projectObservable = fromPromise(
      Project.findOne({
        _id: req.body.id
      })
    );
    let observable = forkJoin(auditObservable, projectObservable);
    observable.subscribe(
      data => {
        let projectName = data[1].title;
        res.json({
          result: data[0],
          msg: projectName
        });
      },
      err => {
        res.status(200).json(
          { success: false, msg: `Something went wrong. ${err}` });
        console.log(err)
      }
    );
  }
  catch (e) {
    console.log(e);
    res.status(500).json({ success: false, msg: `Something went wrong. ${err}` });
  }
}

exports.getStatusOptions = ((req, res) => {
  try {
    ProjectStatus.find({})//.sort({displayName:1})
      .then((result) => {
        sortData.sort(result, 'displayName');
        res.json(result);
      })
      .catch((err) => {
        res.json({
          err: err
        });

      });
  } catch (err) {
    logError("err getStatusOptions", err);
  }
})

exports.getProjectByProjectId = ((req, res) => {

  logInfo(req.body, "getProjectByProjectId req.body");
  let projectObservable = fromPromise(Project.findById(req.params.projectId));
  projectObservable
    .subscribe(
      result => {
        let messages = result.messages.filter((r) => {
          return r.isDeleted === false;
        })
        let uploadFiles = result.uploadFiles.filter((r) => {
          return r.isDeleted === false;
        })
        let data = {
          _id: result._id,
          title: result.title,
          description: result.description,
          startdate: result.startdate,
          enddate: result.enddate,
          status: result.status,
          group: result.group,
          category: result.category,
          userid: result.userid,
          companyId: result.companyId,
          userGroups: result.userGroups,
          sendnotification: result.sendnotification,
          createdBy: result.createdBy,
          createdOn: result.createdOn,
          modifiedBy: result.modifiedBy,
          modifiedOn: result.modifiedOn,
          isDeleted: result.isDeleted,
          projectUsers: result.projectUsers,
          notifyUsers: result.notifyUsers,
          miscellaneous: result.miscellaneous,
          archive: result.archive
        }
        logInfo("getProjectByProjectId before return response");
        res.json({
          data: data,
          messages: messages,
          uploadFiles: uploadFiles
        })
      },
      err => {
        logError("getProjectByProjectId err ", err);
        res.json(err);
      });
})

//Get Project With Task
exports.getProjectDataByProjectId = ((req, res) => {
  logInfo(req.body, "getProjectDataByProjectId req.body");

  Project.findById(req.params.projectId)
    .then((result) => {
      let tasks = result.tasks.filter((r) => {
        return r.isDeleted === false;
      })

      let data = {
        _id: result._id,
        title: result.title,
        description: result.description,
        startdate: result.startdate,
        enddate: result.enddate,
        status: result.status,
        category: result.category,
        group: result.group,
        userid: result.userid,
        companyId: result.companyId,
        userGroups: result.userGroups,
        sendnotification: result.sendnotification,
        createdBy: result.createdBy,
        createdOn: result.createdOn,
        modifiedBy: result.modifiedBy,
        modifiedOn: result.modifiedOn,
        isDeleted: result.isDeleted,
        projectUsers: result.projectUsers,
        notifyUsers: result.notifyUsers,
        miscellaneous: result.miscellaneous,
        archive: result.archive
      }

      logInfo("getProjectDataByProjectId end");
      res.json({
        data: data,
        tasks: tasks
      })
    })
    .catch((err) => {
      logError("getProjectDataByProjectId err", err);
      res.json(err);
    })
})

//okay 
exports.createProject = (req, res) => {
  debugger;
  try {
    console.log('Incoming request body:', req.body);

    let userRole = req.userInfo.userRole.toLowerCase();
    let accessCheck = access.checkEntitlements(userRole);
    debugger;

    if (!accessCheck) {
      console.log('User not authorized');
      return res.status(403).json({ err: errors.NOT_AUTHORIZED });
    }

    let userId = req.userInfo.userId;
    let userName = req.body.userName;

    const projectUsers = req.body.newprojects.projectUsers.map((puser) => puser);
    const notifyUsers = req.body.newprojects.notifyUsers.map((nuser) => nuser);

    const category = req.body.newprojects.category;
    const formattedCategory = Array.isArray(category) ? category.join(', ') : category;
    debugger;

    const newProject = new Project({
      _id: req.body.newprojects._id,
      title: req.body.newprojects.title,
      description: req.body.newprojects.description,
      startdate: req.body.newprojects.startdate,
      enddate: req.body.newprojects.enddate,
      status: req.body.newprojects.status,
      category: formattedCategory,
      userid: req.body.newprojects.userid,
      group: req.body.newprojects.group,
      companyId: req.body.newprojects.companyId,
      userGroups: req.body.newprojects.userGroups,
      sendnotification: req.body.newprojects.sendnotification,
      createdBy: req.body.newprojects.createdBy,
      createdOn: req.body.newprojects.createdOn,
      modifiedBy: req.body.newprojects.modifiedBy,
      modifiedOn: req.body.newprojects.modifiedOn,
      isDeleted: req.body.newprojects.isDeleted,
      projectUsers: projectUsers,
      notifyUsers: notifyUsers,
      miscellaneous: req.body.newprojects.miscellaneous,
      archive: req.body.newprojects.archive
      // Add other properties here...
    });
    debugger;

    newProject.save()
      .then((result) => {
        // Handle successful project creation
        res.status(200).json({
          success: true,
          msg: `Successfully added!`
        });
      })
      .catch((err) => {
        // Handle project creation error
        console.error('Error while creating project:', err);
        res.status(500).json({
          err: errors.ADD_PROJECT_ERROR
        });
      });
  } catch (error) {
    // Handle unexpected errors
    console.error('Error occurred in createProject:', error);
    res.status(500).json({
      err: 'Unexpected error occurred'
    });
  }
  debugger;

};

// UPDATE
exports.updateProject = ((req, res) => {
  // console.log("req.body updated",req.body);
  logInfo(req.body, "updateProject req.body");
  try {
    let userAccess = req.userInfo.userAccess;
    let userRole = req.userInfo.userRole;
    let editProject = false;
    editProject = accessConfig.validateEntitlements(userAccess, req.body.id, 'Projects', 'edit',userRole);

    if (userRole === 'user' && editProject === false) {

      res.json({
        msgErr: errors.NOT_AUTHORIZED
      })
    } else {

      let userName = req.body.userName;

      var projectUser = req.body.newprojects.projectUsers.map((puser) => {
        return puser;
      });

      var notifyUser = req.body.newprojects.notifyUsers && req.body.newprojects.notifyUsers.map((nuser) => {
        return nuser;
      });

      let updatedProject = {
        _id: req.body.id,
        title: req.body.newprojects.title,
        description: req.body.newprojects.description,
        startdate: req.body.newprojects.startdate,
        enddate: req.body.newprojects.enddate,
        status: req.body.newprojects.status,
        category: req.body.newprojects.category,
        userid: req.body.newprojects.userid,
        group: req.body.newprojects.group,
        companyId: req.body.newprojects.companyId,
        userGroups: req.body.newprojects.userGroups,
        sendnotification: req.body.newprojects.sendnotification,
        createdBy: req.body.newprojects.createdBy,
        createdOn: req.body.newprojects.createdOn,
        modifiedBy: req.body.newprojects.modifiedBy,
        modifiedOn: req.body.newprojects.modifiedOn,
        isDeleted: req.body.newprojects.isDeleted,
        projectUsers: projectUser,
        notifyUsers: notifyUser,
        miscellaneous: req.body.newprojects.miscellaneous,
        archive: req.body.newprojects.archive
      };

      let projectUpdate = () => {
        Project.findOneAndUpdate({
          _id: updatedProject._id
        }, updatedProject, {
            context: 'query'
          })
          .then((oldResult) => {

            Project.findOne({
              _id: updatedProject._id
            })
              .then((newResult) => {
                logInfo(newResult, "updateProject newResult");
                let userIdToken = req.userInfo.userName;
                let fields = [];
                var res1 = Object.assign({}, oldResult);
                for (let keys in res1._doc) {
                  if (keys !== 'createdBy' && keys !== 'createdOn' && keys !== 'modifiedBy' && keys !== 'modifiedOn' && keys !== '_id' &&
                    keys !== 'messages' && keys !== 'uploadFiles' && keys !== 'tasks') {
                    fields.push(keys);
                  }
                }

                fields.filter((field) => {
                  if (oldResult[field] !== newResult[field]) {
                    if (oldResult[field].length !== 0 || newResult[field].length !== 0) {
                      if (field === 'userid') {
                        User.find({
                          id: oldResult[field]
                        })
                          .then((result) => {
                            let oldOwner = result[0].name;
                            audit.insertAuditLog(oldOwner, newResult.title, 'Project', field, userName, userIdToken, newResult._id);
                          })
                      } else if (field === 'projectUsers') {
                        let oldProjectUsers = oldResult[field].map((o) => {
                          return o.name;
                        })
                        let newProjectUsers = newResult[field].map((n) => {
                          return n.name;
                        })
                        if (oldProjectUsers.length !== newProjectUsers.length) {
                          audit.insertAuditLog(oldProjectUsers.join(','), newResult.title, 'Project', field, newProjectUsers.join(','),
                            userIdToken, newResult._id);
                        }
                      } else if (field === 'notifyUsers') {
                        let oldNotifyUsers = oldResult[field].map((o) => {
                          return o.name;
                        })
                        let newNotifyUsers = newResult[field].map((n) => {
                          return n.name;
                        })
                        if (oldNotifyUsers.length !== newNotifyUsers.length) {
                          audit.insertAuditLog(oldNotifyUsers.join(','), newResult.title, 'Project', field, newNotifyUsers.join(','),
                            userIdToken, newResult._id);
                        }
                      } else if (field === 'userGroups') {
                        let oldUserGroups = oldResult[field].map((o) => {
                          return o.groupName;
                        })
                        let newUserGroups = newResult[field].map((n) => {
                          return n.groupName;
                        })
                        if (oldUserGroups.length !== newUserGroups.length) {
                          audit.insertAuditLog(oldUserGroups.join(','), newResult.title, 'Project', field, newUserGroups.join(','),
                            userIdToken, newResult._id);
                        }
                      } else {
                        audit.insertAuditLog(oldResult[field], newResult.title, 'Project', field, newResult[field], userIdToken, newResult._id);
                      }
                    }
                  }
                })
                res.json({
                  success: true,
                  msg: `Successfully updated!`
                });
              })
              .catch((err) => {
                logError(errors.EDIT_PROJECT_ERROR, "updateProject errors.EDIT_PROJECT_ERROR");
                res.json({
                  err: errors.EDIT_PROJECT_ERROR
                });
                return;
              });
          })
      }


      if (req.body.newprojects.status === 'completed') {
        Project.find({
          _id: req.body.id
        })
          .then((result) => {
            if (result[0].tasks.length > 0) {
              let tasks = result[0].tasks.filter((t) => {
                return t.isDeleted === false;
              })
              let taskData = (tasks.length > 0) && tasks.filter((t) => {
                return t.category !== "completed" || t.status !== "completed"

              })
              if (taskData.length > 0) {
                res.json({
                  success: true,
                  msgErr: `You do not have permission to complete the project until all tasks are completed!`
                });
              } else {
                projectUpdate();

              }

            }

          })
      } else {
        projectUpdate();

      }


    }
  } catch (e) {
    logError(e, "updateProject error");
  }
});

exports.updateProjectField = ((req, res) => {
  let userRole = req.userInfo.userRole.toLowerCase();
  let accessCheck = access.checkEntitlements(userRole);
  if (accessCheck === false) {
    res.json({ err: errors.NOT_AUTHORIZED });
    return;
  }
  logInfo("updateProjectField");
  logInfo(req.body, "req.body");
  let updatedProject = new Project({
    _id: req.body._id,
    title: req.body.title,
    description: req.body.description,
    startdate: req.body.startdate,
    enddate: req.body.enddate,
    status: req.body.status,
    category: req.body.category,
    userid: req.body.userid,
    group: req.body.group,
    companyId: req.body.companyId,
    userGroups: req.body.userGroups,
    sendnotification: req.body.sendnotification,
    createdBy: req.body.createdBy,
    createdOn: req.body.createdOn,
    modifiedBy: req.body.modifiedBy,
    modifiedOn: req.body.modifiedOn,
    isDeleted: req.body.isDeleted,
    projectUsers: req.body.projectUsers,
    notifyUsers: req.body.notifyUsers,
    miscellaneous: req.body.miscellaneous,
    archive: req.body.archive
  })
  Project.findOneAndUpdate({
    _id: req.body._id
  }, updatedProject)
    .then((oldResult) => {
      Project.find({
        _id: req.body._id
      })
        .then((newResult) => {
          logInfo("updateProjectField");
          res.json({
            msg: 'Updated Successfully'
          })
        })
    })
    .catch((err) => {
      logError("updateProjectField err", err);
      // console.log("err",err);
    })
})

exports.updateProjectCategory = ((req, res) => {
  let userRole = req.userInfo.userRole.toLowerCase();
  let accessCheck = access.checkEntitlements(userRole);
  if (accessCheck === false) {
    res.json({ err: errors.NOT_AUTHORIZED });
    return;
  } 
  logInfo(req.body, "updateProjectCategory req.body");
  let updatedProject = req.body;
  Project.findOneAndUpdate({
    _id: updatedProject._id
  }, updatedProject)
    .then((oldResult) => {
      Project.findOne({
        _id: updatedProject._id
      })
        .then((newResult) => {
          logInfo("updateProjectCategory");
          res.json({
            msg: 'Updated Successfully'
          })
        })
    })
    .catch((err) => {
      logError("updateProjectCategory err", err);      
    })
})

exports.deleteProject = ((req, res) => {
  logInfo(req.body.id, "deleteProject req.body");

  let userAccess = req.userInfo.userAccess;
  let userRole = req.userInfo.userRole;

  let deleteProject = false;
  deleteProject = accessConfig.validateEntitlements(userAccess, req.body.id, 'Projects', 'delete',userRole);

  if (userRole === 'user' && deleteProject === false) {
    res.json({
      err: "You do not have permission to delete the project"
    })
  } else {
    Project.findOneAndUpdate({
      _id: req.body.id
    }, {
        $set: {
          isDeleted: true
        }
      }, {
        "new": true
      })
      .then((result) => {
        let field = "isDeleted";
        let userIdToken = req.userInfo.userName;
        audit.insertAuditLog("false", result.title, 'Project', field, result[field], userIdToken, result._id);
        FavoriteProject.remove({
          projectId: req.body.id
        })
          .then((result) => {
            logInfo("deleteProject FavoriteProject result");
            res.json({
              msg: "Project deleted successfully!"
            })
          })
        // res.json({
        //   msg: "Project deleted successfully!"
        // })
      })
      .catch((err) => {
        logError("deleteProject err", err);
        res.json(err);
      })
  }

})

// READ (ALL)
exports.getTasksAndUsers = ((req, res) => {
  let userRole = req.userInfo.userRole.toLowerCase();
  let accessCheck = access.checkEntitlementsForUserRole(userRole);
  if (accessCheck === false) {
    res.json({ err: errors.NOT_AUTHORIZED });
    return;
  }
  logInfo("getTasksAndUsers");
  logInfo(req.params.projectId, "req.params.projectId");
  Project.findById(req.params.projectId)
    .then((result) => {
      logInfo("result getTasksAndUsers users");
      logInfo("result getTasksAndUsers tasks");
      let tasks=[];
      
      // if(result.length>0){
       tasks = result.tasks.filter((t) => {
        return t.isDeleted === false;
      })
      let projectUsers =result.projectUsers && result.projectUsers.filter((u)=>{
         return u.name!== undefined && u.name!== null && u.name!== ''})
  
      // }
       res.json({
        users: projectUsers,
        tasks: tasks,
        title: result.title
      });
    })
    .catch((err) => {
      logError("getTasksAndUsers err", err);
      res.json({
        err: `${err}`
      });
    });
});

exports.getAllProjectsSummary = ((req, res) => {
  console.log('Request body:', req.body);

  try {
    let selectedUserId = req.body.userId;
    let selectedUserRole = req.body.userRole;
    let selectedProjectId = req.body.projectId;
    let showArchive = req.body.showArchive;

    logInfo('getAllProjectsSummary');
    logInfo(req.userInfo, 'getAllProjectsSummary userInfo=');

    let userRole = req.userInfo.userRole.toLowerCase();
    let userId = req.userInfo.userId;

    if (!userRole) {
      res.json({
        err: errors.NOT_AUTHORIZED
      });
      return;
    }

    let projects = [];
    let condition = {};
    let projectFields = {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        startdate: 1,
        enddate: 1,
        userid: 1,
        status: 1,
        projectUsers: 1,
        notifyUsers: 1,
        uploadFiles: 1,
        group: 1,
        miscellaneous: 1,
        archive: 1,
        'tasks.status': 1,
        'tasks.completed': 1,
        'tasks.category': 1,
        'tasks.isDeleted': 1,
        'tasks.userId': 1,
        'tasks.endDate': 1
      }
    };

    let projectCondition = '';
    let taskFilterCondition = {
      $match: condition
    };
    let userCondition = {
      isDeleted: false,
      // archive: false
    };

    if (showArchive === false) {
      userCondition['archive'] = false;
    }

    if (selectedProjectId) {
      userCondition['_id'] = ObjectId(selectedProjectId);
    }

    // Declaring userIds array
    let userIds = [];

    if (selectedUserId) {
      if (userRole === 'admin' || userRole === 'owner') {
        if (selectedUserRole === 'owner' || selectedUserRole === 'admin') {
          userCondition.$and = [
            {
              $or: [
                {
                  userid: selectedUserId
                },
                {
                  'projectUsers.userId': selectedUserId
                }
              ]
            },
            { $or: [{ miscellaneous: null }, { miscellaneous: false }] }
          ];
        } else {
          userCondition = {
            isDeleted: false,
            $or: [{ miscellaneous: null }, { miscellaneous: false }],
            'projectUsers.userId': selectedUserId
          };
        }
      } else {
        res.json({
          err: errors.NOT_AUTHORIZED
        });
        return;
      }
    } else {
      if (userRole !== 'admin') {
        if (userRole === 'owner') {
          userCondition.$or = [
            {
              userid: userId
            },
            {
              'projectUsers.userId': userId
            }
          ];
        } else {
          userCondition = {
            isDeleted: false,
            'projectUsers.userId': userId
          };
        }
      }
    }

    let projectCond = {
      $match: userCondition
    };

    logInfo([projectCond, projectFields], 'getAllProjectsSummary filtercondition');

    Project.aggregate([projectCond, projectFields])
      .then((result) => {
        console.log('Projects retrieved:', result.length);

        if (!Array.isArray(result)) {
          throw new Error('Invalid result format');
        }

        let date = dateUtil.DateToString(new Date().toISOString());
        let projects = result.map((p) => {
          // ... Existing logic remains unchanged

          return p;
        });

        let projUsers = [];

        if (userIds.length > 0) {
          for (let i = 0; i < userIds.length; i++) {
            if (!projUsers.includes(userIds[i].toString())) {
              projUsers.push(userIds[i].toString());
            }
          }
        }

        let totalProjectUser = projUsers.length;

        logInfo('getAllProjectsSummary projects');
        var result1 = sortData.sort(projects, 'title');
        res.json({
          success: true,
          data: projects,
          count: userRole === 'user' ? 1 : totalProjectUser
        });
      })
      .catch((err) => {
        console.error('Error in project aggregation:', err);
        logError(err, 'getAllProjectsSummary err');
        res.json({
          err: errors.SERVER_ERROR
        });
      });
  } catch (e) {
    logError('e getAllProjectsSummary', e);
  }
});

exports.getProjectData = ((req, res) => {
  try {
    Project.find({ isDeleted: false, status: 'inprogress' }, { _id: 1, title: 1 })
      .then((result) => {
        res.json(result)
      })
  }
  catch (e) {
    logError("getProjectData", e);
  }

})

exports.addProjectUsers = ((req, res) => {
  // console.log("req.body", req.body);
  try {
    Project.findOneAndUpdate({ _id: req.body.projectId }, { $set: { projectUsers: req.body.projectUsers } })
      .then((result) => {
        // console.log("result", result);
        res.json({ msg: "Successfully added" })
      })
      .catch((err) => {
        // console.log("err addProjectUsers", err);
        logError("addProjectUsers err", err);
      })
  }
  catch (err) {
    // console.log("err", err);
    logError("addProjectUsers err", err);
  }
})


// console.log('getUserProject out')
exports.getUserProject = ((req, res) => {
  try {
  
    Project.find({
      isDeleted: false,
      // 'status': { $ne: 'onHold' }
      archive:false

      // miscellaneous: false
    }, {
        _id: 1,
        title: 1,
        status: 1,
        projectUsers: 1
      })
      .then((result) => {
        res.json(result)
      })
  }
  catch (e) {
    // console.log('getUserProject', e)
    logError("getUserProject", e);
  }

})

exports.archiveProject=((req,res)=>{
  logInfo(req.body, "archiveProject req.body");

  let userAccess = req.userInfo.userAccess;
  let userRole = req.userInfo.userRole;

  let archiveProject = false;
  archiveProject = accessConfig.validateEntitlements(userAccess, req.body.projectId, 'Projects', 'archive',userRole);

  if (userRole === 'user' && archiveProject === false) {
    res.json({
      err: "You do not have permission to archive the project"
    })
  } else {
    Project.findOneAndUpdate({
      _id: req.body.projectId
    }, {
        $set: {
          archive: req.body.archive
        }
      }, {
        "new": true
      })
      .then((result) => {
        let field = "archive";
        let userIdToken = req.userInfo.userName;
        audit.insertAuditLog("false", result.title, 'Project', field, result[field], userIdToken, result._id);
       res.json(result)
      })
      .catch((err) => {
        logError("archiveProject err", err);
        res.json(err);
      })
  }

})
