const mongoose = require('mongoose');
const Group = require('../../models/group/group-model');
const jwt = require('jsonwebtoken');
const { logError, logInfo } = require('../../common/logger');
const access = require('../../check-entitlements');
const sortData = require('../../common/common');
const cacheManager = require('../../redis');
const errors = {
  GROUP_DOESNT_EXIST: 'Group does not exist',
  ADDGROUPERROR: 'Error occurred while adding the group',
  EDITGROUPERROR: 'Error occurred while updating the group',
  DELETEGROUPERROR: 'Error occurred while deleting the group',
  "NOT_AUTHORIZED": "Your are not authorized"
};

//Get All Group
exports.getAllGroups = (async (req, res) => {
  // let userRole = req.userInfo.userRole.toLowerCase();
  // let accessCheck = access.checkEntitlements(userRole);
  // if(accessCheck === false) {
  //     res.json({ err: errors.NOT_AUTHORIZED });
  //     return;
  // }

  var cachedData = await cacheManager.getCachedData("groupsData"); 

  if(!!cachedData){

    if(cachedData.length > 0){
      res.json(cachedData);
      return;
    }
  }

  Group.find({ $or: [{ isDeleted: null }, { isDeleted: false }] })//.sort({groupName: 1})
  .then((result) => {
    cacheManager.setCachedData("groupsData", result);
    logInfo("getAllGroups result", result.length);
    var result1 = sortData.sort(result,'groupName');
    res.json(result ? result : []);
  })
  .catch((err) => {
    res.status(500).json({ success: false, msg: `Something went wrong. ${err}` });
  });
})


// // CREATE
exports.addGroup = ((req, res) => {
  try {
    let userRole = req.userInfo.userRole.toLowerCase();
    let accessCheck = access.checkEntitlements(userRole);
    if(accessCheck === false) {
        res.json({ err: errors.NOT_AUTHORIZED });
        return;
    }
    logInfo(req.body, "addGroup");
    let newGroup = new Group(req.body);
    newGroup.save()
    .then((result) => {
      cacheManager.clearCachedData("groupsData");
      logInfo(result, "addGroup result");
      res.json({
        success: true,
        msg: `Successfully added!`,
        result: result
      });
    })
    .catch((err) => {
      if (err.errors) {
        res.json({ err: errors.ADDGROUPERROR });
      }
    });
  }
  catch (e) {
    logError("addGroup err", e);
  }
});


exports.deleteGroup = ((req, res) => {
  try {
    let userRole = req.userInfo.userRole.toLowerCase();
    let accessCheck = access.checkEntitlements(userRole);
    if(accessCheck === false) {
        res.json({ err: errors.NOT_AUTHORIZED });
        return;
    }
    logInfo(req.body, "deleteGroup");
    let updatedGroup = req.body;
    Group.findOneAndUpdate({ "_id": updatedGroup[0]._id }, { $set: { 'isDeleted': updatedGroup[0].isDeleted } })
    .then((result) => {
      cacheManager.clearCachedData("groupsData");
      logInfo(result, "deleteGroup result");
      res.json({
        success: true,
        msg: `Successfully Deleted!`,
        result: result
      })
    })
    .catch((err) => {
      if (err.errors) {
        res.json({ err: errors.DELETEGROUPERROR });
      }
    });
  }
  catch (e) {
    logError("deleteGroup err", e);
  }
})

exports.editGroup = ((req, res) => {
  try {
    let userRole = req.userInfo.userRole.toLowerCase();
    let accessCheck = access.checkEntitlements(userRole);
    if(accessCheck === false) {
        res.json({ err: errors.NOT_AUTHORIZED });
        return;
    }
    let updatedGroup = req.body
    logInfo(req.body, "updatedGroup");
    Group.findOneAndUpdate({ "_id": req.body._id }, updatedGroup)
    .then((result) => {
      cacheManager.clearCachedData("groupsData");
      logInfo(result, "updatedGroup result");
      res.json({
        success: true,
        msg: `Successfully Updated!`,
        result: result
      })
    })
    .catch((err) => {
      if (err.errors) {
        res.json({ err: errors.EDITGROUPERROR });
      }
    });
  }
  catch (e) {
    logError("editGroup err", e);
  }
})