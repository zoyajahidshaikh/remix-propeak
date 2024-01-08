const User = require('../../../models/user/user-model');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const async = require('async');
const config = require("../../../config/config");
const AccessRight = require('../../../models/access-right/access-right-model');
const { sendEmail } = require('../../../common/mailer');
const { generateAccessToken, generateRefreshToken, decodeToken } = require('../../../verify-token/token-management');
const { ACCESS_TOKEN, REFRESH_TOKEN } = require('../../../common/const');
const Token = require('../../../models/Token/token');
const tokenController = require('../../../controllers/token/token-controller');
const access = require('../../../check-entitlements');

const errors = {
  REGISTER_EMAIL_TAKEN: 'Email is unavailable',
  RESET_PASSWORD: 'An error has occured while reseting password',
  REGISTER_GENERAL_ERROR: 'An error has occured while adding/updating user',
  LOGIN_INVALID: 'Invalid Email/Password combination',
  LOGIN_GENERAL_ERROR: 'Invalid user credentials',
  RESET_EXPIRE: 'Your link has expired, kindly reset again',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  LOGIN_GENERAL_ERROR_DELETE: 'An error has occured while deleting user',
  "NOT_AUTHORIZED": "You are not authorized",
  ACTIVE_ERROR: 'Your Account is Deactivated',
  LOGIN_LOCKED_ERROR: 'Your Account has been Locked. Please reset your password to login again.',
  RESET_PASSWORD_ERROR: 'Your Account has been locked please reset password After One hour'
};
let count = 0;
let isLocked = false;

exports.login = function (req, res) {
  try {
    function loginAttemptupdate(email, isLocked) {
      // console.log("loginAttemptupdate email", email);
      User.findOneAndUpdate({
        // _id: user._id
        email: email, isActive: true
      }, {
          $set: {
            isLocked: isLocked,
            lockedDateTime: new Date()
          }
        }, {
          "new": true
        })
        .then((result) => {

          count = 0;
          res.json({
            err: errors.LOGIN_LOCKED_ERROR
          });

        })


    }
    if (!req.body.email || !req.body.password) {

      return res.json({ err: errors.LOGIN_INVALID });
    }

    User.findOne({
      email: req.body.email,
      isActive: true,
      //isLocked: false
    }).exec((err, user) => {
      if (err) {

        return res.json({ err: errors.LOGIN_GENERAL_ERROR });
      }
      else if (!user) {

        return res.json({ err: errors.LOGIN_GENERAL_ERROR });
      }


      user.comparePassword(req.body.password, function (err, isMatch) {
        if (err) {
          count++;

          if (count === config.loginAttemptCount) {
            isLocked = true;
            loginAttemptupdate(req.body.email, isLocked);
          }
          else {
            return res.json({
              err: errors.LOGIN_INVALID
            });
          }

        }

        if (isMatch) {
          AccessRight.find({ userId: user._id }, { projectId: 1, entitlementId: 1, group: 1 })
            .then((result1) => {
              // console.dir(result1);
              var u = { '_id': user._id, 'name': user.name, 'role': user.role, 'access': result1, 'profilePicture': user.profilePicture }
              var token = generateAccessToken(u);
              var refreshToken = generateRefreshToken(u);
              res.setHeader(ACCESS_TOKEN, token);
              res.setHeader(REFRESH_TOKEN, refreshToken);
              tokenController.saveRefreshToken(token, refreshToken, user._id);
              if (user.isLocked === false) {
                return res.json({
                  user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    access: result1,
                    profilePicture: user.profilePicture,
                  }
                });
              }
              else {
                res.json({
                  err: errors.LOGIN_LOCKED_ERROR
                })
              }

            })
            .catch((err) => {
              // console.log("err", err);
            })
        }
        else {
          count++;

          if (count === config.loginAttemptCount) {
            isLocked = true;
            loginAttemptupdate(req.body.email, isLocked);
          }
          else {
            return res.json({
              err: errors.LOGIN_INVALID
            });
          }

        }
      });
    });
  }
  catch (e) {
    // console.log("err", e);
  }
}

exports.forgotPassword = function (req, res, next) {
  let email = req.params.email;
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({
        email: req.params.email
      }, function (err, user) {
        if (!user) {
          return res.json({
            err: errors.LOGIN_GENERAL_ERROR
          })
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function (err) {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
      var mailOptions = {
        to: user.email,
        from: config.from,
        subject: 'Project Management System - Password Reset',
        html: 'Hi, <br><br> You are receiving this because you (or someone else) have requested the reset of the password for your account.<br>' +
          'Please click on the following link, or paste this into your browser to complete the process:<br>' +
          config.link + 'users/reset/' + token + '<br><br>' +
          'If you did not request this, please ignore this email and your password will remain unchanged.<br><br> Thanks, <br> proPeak Team'
      };
      let response = sendEmail(mailOptions);
      if (response.response) {
        logInfo(response, 'userController.forgotPassword - Error occured while sending email ' + mailOptions.to);
      }
      else {
        return res.json({
          msg: 'An e-mail has been sent to ' + mailOptions.to + ' with further instructions.'
        })
        logInfo('taskController.forgotPassword - An e-mail has been sent to ' + mailOptions.to + ' with further instructions.');

      }
    }

  ], function (err) {
    if (err) return next(err);
  });
}

exports.resetPass = (req, res) => {
  try {
    let updatedPass = req.body;
    User.findOne({ "resetPasswordToken": updatedPass.token }).exec((err, user) => {
      if (err) {
        return res.status(500).send({ err: "Internal server error" });
      }
      else if (!user) {
        return res.json({ err: "Invalid user" });
      } else if (user.resetPasswordExpires < Date.now()) {
        return res.json({ err: errors.RESET_EXPIRE })
      }
      user.password = req.body.password;
      if (user.isLocked === true) {
        user.isLocked = false
      }
      if (user.password !== req.body.confirmPassword) {
        return res.json({ err: errors.PASSWORDS_DONT_MATCH })
      } else {
        user.save().then((result) => {
          res.json({
            success: true,
            msg: `Successfully updated!`,
            result: {
              _id: result._id,
              name: result.name,
              role: result.role,
              email: result.email,
              companyId: result.companyId
            }
          });
        })
          .catch((err) => {
            if (err.errors) {
              res.json({ err: errors.RESET_PASSWORD });
            }
          });
      }
    });
  }
  catch (e) {
    // console.log(e);
  }
}

exports.changePassword = (req, res) => {
  let updatedPassword = req.body;
  let userId = req.userInfo.userId;
  User.findOne({ _id: userId }).exec((err, user) => {
    if (err) {
      return res.status(500).send({ err: "Internal server error" });
    }
    else if (!user) {
      return res.json({ err: "Invalid user" });
    }
    user.password = req.body.newPassword;

    if (user.password !== req.body.newConfirmPassword) {
      return res.json({ err: errors.PASSWORDS_DONT_MATCH })
    } else {
      user.save().then((result) => {
        res.json({
          success: true,
          msg: `Successfully updated!`,
          result: {
            _id: result._id,
            name: result.name,
            role: result.role,
            email: result.email,
            companyId: result.companyId
          }
        });
      })
        .catch((err) => {
          if (err.errors) {
            res.json({ err: errors.RESET_PASSWORD });
          }
        });
    }

  });
}

exports.logout = function (req, res) {
  try {
    // console.log("logout");
    var token = req.headers[ACCESS_TOKEN];

    // console.log(token);

    tokenController.removeToken(token);

    res.json({
      success: true,
      msg: `Token deleted.`,
      token: "",
      refreshToken: ''
    });

  }
  catch (e) {
    // console.log("err", e);
    logInfo("logout", e);
  }
}