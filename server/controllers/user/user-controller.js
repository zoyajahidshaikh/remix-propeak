const mongoose = require('mongoose');
const User = require('../../models/user/user-model');
var bodyParser = require('body-parser');
const uuidv4 = require('uuid/v4');
const secret = require('../../config/secret');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const async = require('async');
const ProjectUsers = require('../../models/project/project-user-model');
const config = require("../../config/config");
const audit = require('../audit-log/audit-log-controller');
const Project = require('../../models/project/project-model');
const AccessRight = require('../../models/access-right/access-right-model');
const {
  sendEmail
} = require('../../common/mailer');
const {
  addMyNotification
} = require('../../common/add-my-notifications');
const {
  generateAccessToken,
  generateRefreshToken,
  decodeToken
} = require('../../verify-token/token-management');
const {
  ACCESS_TOKEN,
  REFRESH_TOKEN
} = require('../../common/const');
const Token = require('../../models/Token/token');
const tokenController = require('../token/token-controller');
const access = require('../../check-entitlements');
const sortData = require('../../common/common');
const DefaultAppLevelAccessRight = require('../../models/access-right/defaultapplevelaccessright-model');
// const DefaultProjectAssign = require('../../models/project/project-model');
// const ProjectUserSchema = require('../../models/project/project-user-model');
const AppLevelAccessRight = require('../../models/access-right/applevelaccessright-model');
const {
  logError,
  logInfo
} = require('../../common/logger');
const cacheManager = require('../../redis');
const rabbitMQ = require('../../rabbitMQ');
// const objectId = require('../../common/common');

const errors = {
  REGISTER_EMAIL_TAKEN: 'Email is unavailable',
  RESET_PASSWORD: 'An error has occured while reseting password',
  REGISTER_GENERAL_ERROR: 'An error has occured while adding/updating user',
  LOGIN_INVALID: 'Invalid Email/Password combination',
  LOGIN_GENERAL_ERROR: 'Invalid user credentials',
  RESET_EXPIRE: 'Your link has expired, kindly reset again',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  LOGIN_GENERAL_ERROR_DELETE: 'An error has occured while deleting user',
  "NOT_AUTHORIZED": "Your are not authorized"
};

exports.getUser = (req, res) => {
  //res.setHeader(ACCESS_TOKEN, req.token);
  let userRole = req.userInfo.userRole.toLowerCase();
  let accessCheck = access.checkEntitlements(userRole);
  if (accessCheck === false) {
    res.json({
      err: errors.NOT_AUTHORIZED
    });
    return;
  }
  User.findOne({
    _id: req.params.id
  }, {
      _id: 1,
      name: 1,
      email: 1,
      role: 1,
      isDeleted: 1,
      companyId: 1,
      reportingManagerId: 1,
      contactNumber: 1,
      alternateNumber: 1,
      gender: 1,
      dob: 1,
      isActive: 1,
      isLocked: 1,
      dateOfJoining: 1,
      designation: 1,
      bloodGroup: 1,
      currentAddress: 1,
      permanentAddress: 1,
      panNo: 1,
      addharNo: 1,
      passportNo: 1,
      passportName: 1,
      passportissueDate: 1,
      passportexpiryDate: 1,
      placeOfIssue: 1,
      createdBy: 1,
      createdOn: 1,
      modifiedBy: 1,
      modifiedOn: 1
    })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.json({
        err: errors.LOGIN_GENERAL_ERROR
      });
    });
}

exports.getUsers = async (req, res) => {

  var cachedData = await cacheManager.getCachedData("usersData");
  // console.log("cachedData", cachedData);
  if (!!cachedData) {

    if (cachedData.length > 0) {
      res.json(cachedData);
      return;
    }
  }

  User.find({
    isDeleted: false
  }, {
      _id: 1,
      name: 1,
      email: 1,
      role: 1,
      //isDeleted: 1,
      companyId: 1,
      reportingManagerId: 1,
      contactNumber: 1,
      alternateNumber: 1,
      gender: 1,
      dob: 1,
      // isActive: 1,
      // isLocked: 1,
      dateOfJoining: 1,
      designation: 1,
      bloodGroup: 1,
      currentAddress: 1,
      permanentAddress: 1,
      panNo: 1,
      addharNo: 1,
      passportNo: 1,
      passportName: 1,
      passportissueDate: 1,
      passportexpiryDate: 1,
      placeOfIssue: 1,
      createdBy: 1,
      createdOn: 1,
      modifiedBy: 1,
      modifiedOn: 1
    }) //.sort({name: 1})
    .then((result) => {
      // console.log("result", result);
      cacheManager.setCachedData("usersData", result);
      res.json(result);
    })
    .catch((err) => {
      res.json({
        err: errors.LOGIN_GENERAL_ERROR
      });
    });
}

//  Create a new user - post request
exports.postAddUser = (req, res) => {
  try {
    //res.setHeader(ACCESS_TOKEN, req.token);
    let userRole = req.userInfo.userRole.toLowerCase();
    // console.log('req.body',req.body);
    let accessCheck = access.checkEntitlements(userRole);
    if (accessCheck === false) {
      res.json({
        err: errors.NOT_AUTHORIZED
      });
      return;
    }
    // let userId = objectId.mongoObjectId();
    let newUser = new User({
      // _id: userId,
      name: req.body.name,
      role: req.body.role,
      email: req.body.email.toLowerCase(),
      password: req.body.password,
      isDeleted: req.body.isDeleted,
      companyId: req.body.companyId,
      reportingManagerId: req.body.reportingManagerId,
      contactNumber: req.body.contactNumber,
      alternateNumber: req.body.alternateNumber,
      gender: req.body.gender,
      dob: req.body.dob,
      isActive: req.body.isActive,
      isLocked: req.body.isLocked,
      dateOfJoining: req.body.dateOfJoining,
      designation: req.body.designation,
      bloodGroup: req.body.bloodGroup,
      currentAddress: req.body.currentAddress,
      permanentAddress: req.body.permanentAddress,
      panNo: req.body.panNo,
      addharNo: req.body.addharNo,
      passportNo: req.body.passportNo,
      passportName: req.body.passportName,
      passportissueDate: req.body.passportissueDate,
      passportexpiryDate: req.body.passportexpiryDate,
      placeOfIssue: req.body.placeOfIssue,
      createdBy: req.body.createdBy,
      createdOn: req.body.createdOn,
      modifiedBy: req.body.modifiedBy,
      modifiedOn: req.body.modifiedOn


    });
    console.log('newUser', newUser);
    newUser.save()
      .then((result) => {
        // console.log('result', result)
        cacheManager.clearCachedData("usersData");
        let userIdToken = req.userInfo.userName;
        let fields = [];
        var res1 = Object.assign({}, result);
        for (let keys in res1._doc) {
          if (keys === 'name' || keys === 'role' || keys === 'email' || keys === 'companyId' || keys === 'reportingManagerId' ||
            keys === 'contactNumber' || keys === 'alternateNumber' || keys === 'gender' || keys === 'dob' || keys === 'isActive' ||
            keys === 'isLocked' || keys === "dateOfJoining" || keys === 'designation' || keys === 'bloodGroup' || keys === 'currentAddress' ||
            keys === 'permanentAddress' || keys === 'panNo' || keys === 'addharNo' || keys === 'passportNo' || keys === 'passportName' ||
            keys === 'passportissueDate' || keys === 'passportexpiryDate' || keys === 'placeOfIssue') {
            fields.push(keys);
          }
        }

        fields.filter((field) => {
          if (result[field] !== '' && result[field] !== null && result[field] !== undefined)
            audit.insertAuditLog('', result.name, 'User', field, result[field], userIdToken, '');
        })



        //Application level access wire save
        DefaultAppLevelAccessRight.find({
          userRole: result.role
        })
          .then((result1) => {
            //  console.log("result1",result1);
            var defaultAppLevelAccessRight = [];
            for (let i = 0; i < result1.length; i++) {
              let newAccessRight = {
                userId: result._id,
                entitlementId: result1[i].entitlement,
                group: result1[i].group,
                access: true,
                createdBy: "",
                createdOn: new Date(),
                isDeleted: false
              }
              defaultAppLevelAccessRight.push(newAccessRight);
            }
            if (defaultAppLevelAccessRight.length > 0) {
              // console.log("defaultAppLevelAccessRight",defaultAppLevelAccessRight);
              AppLevelAccessRight.insertMany(defaultAppLevelAccessRight)
                .then((result2) => {
                  // console.log("result2",result2);
                  logInfo(result2.length, "setUserAccessRights result");

                  var mailOptions = {
                    from: config.from,
                    to: newUser.email,
                    subject: 'Project Management System -new Account created',
                    html: 'Hi, <br> You are receiving this because your account has been created in the proPeak Management System.<br>' +
                      'Please reset your account password by clicking on the following link, ' + config.link + '<br><br> Thanks, <br> proPeak Team'
                  };

                  let userArr = {
                    subject: mailOptions.subject,
                    url: "",
                    userId: result._id
                  };

                  rabbitMQ.sendMessageToQueue(mailOptions, "message_queue", "msgRoute").then((resp) => {
                    logInfo("user add mail message sent to the message_queue:" + resp);
                    addMyNotification(userArr);
                  });

                  res.json({
                    success: true,
                    msg: `Successfully added!`,
                    result: {
                      _id: result._id,
                      name: result.name,
                      role: result.role,
                      email: result.email,
                      isDeleted: result.isDeleted,
                      companyId: result.companyId,
                      reportingManagerId: result.reportingManagerId,
                      contactNumber: result.contactNumber,
                      alternateNumber: result.alternateNumber,
                      gender: result.gender,
                      dob: result.dob,
                      isActive: result.isActive,
                      isLocked: result.isLocked,
                      dateOfJoining: result.dateOfJoining,
                      designation: result.designation,
                      bloodGroup: result.bloodGroup,
                      currentAddress: result.currentAddress,
                      permanentAddress: result.permanentAddress,
                      panNo: result.panNo,
                      addharNo: result.addharNo,
                      passportNo: result.passportNo,
                      passportName: result.passportName,
                      passportissueDate: result.passportissueDate,
                      passportexpiryDate: result.passportexpiryDate,
                      placeOfIssue: result.placeOfIssue,
                      createdBy: result.createdBy,
                      createdOn: result.createdOn,
                      modifiedBy: result.modifiedBy,
                      modifiedOn: result.modifiedOn

                    }
                  });

                })
                .catch((err) => {
                  logError(err, "setUserAccessRights err");
                })
            }

            //Default project Assign 
            Project.find({
              title: config.defaultProject
            })
              .then((result2) => {

                let projectuser = {
                  name: req.body.name,
                  userId: result._id,
                }

                console.log(result2[0].projectUsers.length);
                if (result2[0].projectUsers.length > 0) {
                  result2[0].projectUsers.push(projectuser);
                  try {
                    result2[0].save()
                      .then(function (result3) {
                        console.log(result3);
                      })
                      .catch((err) => {
                        console.log(err);
                      })
                  }
                  catch (e) {
                    console.log(e);
                  }
                }
              })
              .catch((err) => {
                // console.log(err);
              })

          })
          .catch((err) => {
            // console.log(err);
          })

      })
      .catch((err) => {
        if (err.errors) {
          res.json({
            err: errors.REGISTER_GENERAL_ERROR
          });
        }
      });
  } catch (e) {
    console.log("user add error", e);
  }
};

exports.updateUser = (req, res) => {
  let userRole = req.userInfo.userRole.toLowerCase();
  let accessCheck = access.checkEntitlements(userRole);
  if (accessCheck === false) {
    res.json({
      err: errors.NOT_AUTHORIZED
    });
    return;
  }
  let updatedUser = req.body;
  User.findOneAndUpdate({
    _id: updatedUser._id
  }, updatedUser)
    .then((oldResult) => {
      User.findOne({
        _id: updatedUser._id
      })
        .then((newResult) => {
          cacheManager.clearCachedData("usersData");
          let userIdToken = req.userInfo.userName;

          let fields = [];
          var res1 = Object.assign({}, oldResult);
          for (let keys in res1._doc) {
            if (keys === 'name' || keys === 'role' || keys === 'email' || keys === 'companyId' || keys === 'reportingManagerId' ||
              keys === 'contactNumber' || keys === 'alternateNumber' || keys === 'gender' || keys === 'dob' || keys === 'isActive' ||
              keys === "dateOfJoining" || keys === 'designation' || keys === 'bloodGroup' || keys === 'currentAddress' || keys === 'permanentAddress'
              || keys === 'panNo' || keys === 'addharNo' || keys === 'passportNo' || keys === 'passportName' || keys === 'passportissueDate' ||
              keys === 'passportexpiryDate' || keys === 'placeOfIssue') {
              fields.push(keys);
            }
          }

          fields.filter((field) => {
            if (oldResult[field] !== newResult[field]) {
              audit.insertAuditLog(oldResult[field], newResult.name, 'User', field, newResult[field], userIdToken, '');
            }
          })

          if (req.body.isActive === false) {
            tokenController.removeUserTokens(updatedUser._id);
          }

          if (oldResult.role !== newResult.role) {
            AppLevelAccessRight.deleteMany({
              userId: updatedUser._id
            }, {
                "lean": true
              })
              .then((result) => {
                // console.log("result",result);

                DefaultAppLevelAccessRight.find({
                  userRole: updatedUser.role
                })
                  .then((result1) => {
                    //  console.log("result1",result1);
                    var defaultAppLevelAccessRight = [];
                    for (let i = 0; i < result1.length; i++) {
                      let newAccessRight = {
                        userId: updatedUser._id,
                        entitlementId: result1[i].entitlement,
                        group: result1[i].group,
                        access: true,
                        createdBy: "",
                        createdOn: new Date(),
                        isDeleted: false
                      }
                      defaultAppLevelAccessRight.push(newAccessRight);
                    }
                    if (defaultAppLevelAccessRight.length > 0) {
                      AppLevelAccessRight.insertMany(defaultAppLevelAccessRight)
                        .then((result2) => {
                          logInfo(result2.length, "setUserAccessRights result");


                          res.json({
                            success: true,
                            msg: `Successfully updated record!`
                          });
                          // res.json({ msg: "Access Rights updated successfully" })
                        })
                        .catch((err) => {
                          logError(err, "setUserAccessRights err");
                        })
                    }
                  })

              })
          } else {
            res.json({
              success: true,
              msg: `Successfully updated record!`
            });
          }

        })
        .catch((err) => {
          res.json({
            err: errors.LOGIN_GENERAL_ERROR
          });
          return;
        });
    })
    .catch((err) => {
      if (err.errors) {
        // Show failed if all else fails for some reasons
        res.json({
          err: errors.LOGIN_GENERAL_ERROR
        });
      }
    });
}


exports.deleteUser = (req, res) => {
  let userRole = req.userInfo.userRole.toLowerCase();
  let accessCheck = access.checkEntitlements(userRole);
  if (accessCheck === false) {
    res.json({
      err: errors.NOT_AUTHORIZED
    });
    return;
  }
  // console.log("req.body",req.body.id);
  let userId = req.body.id;
  User.findOneAndUpdate({
    _id: userId
  }, {
      $set: {
        isDeleted: true
      }
    }, {
      "new": true
    })
    .then((result) => {
      cacheManager.clearCachedData("usersData");
      let token = req.headers.token;

      //Remove all user tokens
      tokenController.removeUserTokens(userId);
      //End Remove all user tokens

      let userIdToken = req.userInfo.userName;
      let field = '';
      var res1 = Object.assign({}, result);
      for (let keys in res1._doc) {
        if (keys === 'name') {
          field = keys;
        }
      }
      audit.insertAuditLog(false, result.name, 'User', field, result[field], userIdToken, '');

      res.json({
        success: true,
        msg: `It has been deleted.`,
        result: {
          name: result.name
        }
      });

    })
    .catch((err) => {
      res.json({
        err: errors.LOGIN_GENERAL_ERROR_DELETE
      });
    });
}



exports.getProfilePicture = (req, res) => {

  User.findOne({
    _id: req.body.userId
  }, {
      profilePicture: 1
    })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.json({
        err: errors.LOGIN_GENERAL_ERROR
      });
    });
}