const mongoose = require('mongoose');
const Notification = require('../../models/notification/notification-model');
const Project = require('../../models/project/project-model');
const User = require('../../models/user/user-model');
const HideNotification = require('../../models/notification/hide-notification-model');
const jwt = require('jsonwebtoken');
const {
  logError,
  logInfo
} = require('../../common/logger');
const accessConfig = require('../../common/validate-entitlements');
const access = require('../../check-entitlements');
const sortData = require('../../common/common');
const errors = {
  ADDNOTIFICATIONERROR: 'Error occurred while adding the notification',
  EDITNOTIFICATIONERROR: 'Error occurred while updating the notification',
  DELETENOTIFICATIONERROR: 'Error occurred while deleting the notification',
  ADDHIDENOTIFICATIONERROR: 'Error occurred while adding the hide notification',
  "NOT_AUTHORIZED": "You're are not authorized"
};
const { addMyNotification } = require('../../common/add-my-notifications');
const dateUtil = require('../../utils/date-util');

// CREATE
exports.createNotification = ((req, res) => {
  try {
    logInfo(req.body, "createNotification");
    let createNotification = false;
    let userRole = req.userInfo.userRole;
    if(req.body.projectId !== '000'){
      let userAccess = req.userInfo.userAccess;
      createNotification = accessConfig.validateEntitlements(userAccess, req.body.projectId, 'Notification', 'create', userRole);
    }
    if(createNotification === false && userRole === 'user') {
      res.json({
        err: errors.NOT_AUTHORIZED
      })
    } else {
      if(req.body.projectId !== '000'){
        Project.findById(req.body.projectId)
        .then((result1) => {
          let projUsers = result1.projectUsers.map((p) => {
            return p.userId;
          })
          if(!projUsers.includes(result1.userid)) {
            projUsers.push(result1.userid);
          }
          User.find({role: 'admin'})
          .then((result) => {
            let adminIds = [];
            if(result.length > 0){
              for(let j=0;j<result.length;j++){
                adminIds.push(result[j]._id);
              }
            }
            if(adminIds.length > 0){
              for(let i=0;i<adminIds.length;i++){
                if(!projUsers.includes(adminIds[i].toString())) {
                  projUsers.push(adminIds[i].toString());
                }
              }
              newNotification(projUsers)
            }
          })
        })
      } else {
        User.find({$or:[{isDeleted: null},{isDeleted:false}]})
        .then((result2) => {
          let users = result2.map((r) => {
            return r._id.toString();
          })
          newNotification(users)
        })
      }

      newNotification = (projUsers) => {
        let newNotification = new Notification({ 
          notification: req.body.notification.notification,
          toDate: req.body.notification.toDate,
          fromDate: req.body.notification.fromDate,
          isDeleted: req.body.notification.isDeleted,
          hidenotifications:[],
          shownotifications: projUsers, 
          projectId: req.body.projectId 
        });
        newNotification.save()
        .then((result) => {
          logInfo(result, "createNotification result");
          // console.log("notification result",result);
          let currentDate = dateUtil.DateToString(new Date());
          if(dateUtil.DateToString(result.fromDate) < currentDate || dateUtil.DateToString(result.fromDate) === currentDate){
            for(let i=0;i<result.shownotifications.length;i++){
              let notificationObject = {subject: result.notification, url: "", userId: result.shownotifications[i]};
              addMyNotification(notificationObject);
            }
          }
        
          res.json({
            success: true,
            msg: `Successfully added!`,
          });
        })
        .catch((err) => {
          if (err.errors) {
            res.json({
              err: errors.ADDNOTIFICATIONERROR
            });
          }
        });
      }
    } 
  } catch (e) {
    logError(e,"createNotification e");
  }
});


//Get All Notifications
exports.getAllNotifications = ((req, res) => {
  let userRole = req.userInfo.userRole.toLowerCase();
  let accessCheck = access.checkEntitlements(userRole);
  let userAccess = req.userInfo.userAccess;
  viewNotification = accessConfig.validateEntitlements(userAccess, req.params.projectId, 'Notification', 'view',userRole);
  // console.log("viewNotification",viewNotification);
  if(accessCheck === false && !viewNotification) {
    // console.log("here");
      res.json({ err: errors.NOT_AUTHORIZED });
      return;
  }
  // console.log("out");
  Notification.find({
      $or: [{
        isDeleted: null
      }, {
        isDeleted: false
      }]
  })//.sort({notification: 1})
  .then((result) => {
    if(req.params.projectId === '000'){
       sortData.sort(result,'notification');
    
      res.json(result);
   
    }
    else{
      let projectResult = result && result.filter((r)=>{
        return r.projectId === req.params.projectId;
      });
     sortData.sort(projectResult,'notification');
      res.json(projectResult);
    }  
  })
  .catch((err) => {
    res.status(500).json({
      success: false,
      msg: `Something went wrong. ${err}`
    });
  });

})

//Get NotificationById
exports.getNotificationById = ((req, res) => {
  let userRole = req.userInfo.userRole.toLowerCase();
  let accessCheck = access.checkEntitlementsForUserRole(userRole);
  if(accessCheck === false) {
      res.json({ err: errors.NOT_AUTHORIZED });
      return;
  }
  Notification.find({
      _id: req.params.id,
    })
    .then((result) => {
      res.json({
        data: result
      })
    })
})

exports.deleteNotification = ((req, res) => {
  try {
    logInfo(req.body, "deleteNotification");
    let updatedNotification = req.body;
    let userRole = req.userInfo.userRole;
    let deleteNotification = false;
    if(updatedNotification[0].projectId !== '000'){
      let userAccess = req.userInfo.userAccess;
      deleteNotification = accessConfig.validateEntitlements(userAccess, updatedNotification[0].projectId, 'Notification', 'delete',userRole);
    }
    if(deleteNotification === false && userRole === 'user'){
      res.json({
        err :  errors.NOT_AUTHORIZED
      })
    } else {
      Notification.findOneAndUpdate({
        "_id": updatedNotification[0]._id
      }, {
        $set: {
          'isDeleted': updatedNotification[0].isDeleted
        }
      })
      .then((result) => {
        logInfo(result, "deleteNotification result");
        res.json({
          success: true,
          msg: `Successfully Updated!`,
          result: result
        })
      })
      .catch((err) => {
        if (err.errors) {
          res.json({
            err: errors.DELETENOTIFICATIONERROR
          });
        }
      });
    }
    
  } catch (e) {
    // console.log(e);
  }
})

exports.updateNotification = ((req, res) => {
  try {
    logInfo(req.body, "updateNotification");
    let updatedNotification = req.body;
    let userRole = req.userInfo.userRole;
    let updateNotification = false;
    if(req.body.projectId !== '000'){
      let userAccess = req.userInfo.userAccess;
      updateNotification = accessConfig.validateEntitlements(userAccess, req.body.projectId, 'Notification', 'edit',userRole);
    }
    if(updateNotification === false && userRole === 'user'){
      res.json({
        err :  errors.NOT_AUTHORIZED
      })
    } else {
    Notification.findOneAndUpdate({
        "_id": req.body._id
      }, updatedNotification)
      .then((result) => {
        logInfo(result, "updateNotification result");
        res.json({
          success: true,
          msg: `Successfully Updated!`,
          result: result
        })
      })
      .catch((err) => {
        if (err.errors) {
          res.json({
            err: errors.EDITNOTIFICATIONERROR
          });
        }
      });
    }
  } catch (e) {
    // console.log(e);
  }
})

exports.createHideNotification = ((req, res) => {
  try {
    logInfo(req.body, "createHideNotification");
    Notification.findOneAndUpdate({
        _id: req.body.notificationId
      }, {
        $push: {
          hidenotifications: req.body.userId
        }
    })
    .then((result) => {
      res.json({
        success: true,
        msg: `Successfully added!`,
        result: result
      });
    })
  } catch (e) {
    // console.log(e);
  }
});

//Get All Hide Notifications 
exports.getAllUnHideNotifications = ((req, res) => {
  try {
  let userIdToken = req.userInfo.userId;
  Notification.find({
      $and: [{
          $or: [{
            isDeleted: null
          }, {
            isDeleted: false
          }
        ]},
        { hidenotifications: { "$nin" : [userIdToken] } },
        ]
    })
    .then((result) => {
      let userNotifications = [];
      if(result.length > 0){
        for(let i=0;i<result.length ;i++){
          let notifications=result[i].shownotifications.filter((s) => {
            return s === userIdToken;
          })
          if(notifications.length > 0){
            userNotifications.push(result[i]);
          } 
        }
        res.json(userNotifications);
      }
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        msg: `Something went wrong. ${err}`
      });
    });
  }
  catch (e) {
    // console.log(e);
  }
})