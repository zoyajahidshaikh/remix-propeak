const mongoose = require("mongoose");
const Category = require("../../models/category/category-model");
const uuidv4 = require("uuid/v4");
const jwt = require("jsonwebtoken");
const secret = require("../../config/secret");
const audit = require("../audit-log/audit-log-controller");
const access = require("../../check-entitlements");
const sortData = require("../../common/common");
const cacheManager = require("../../redis");
const errors = {
  NOT_AUTHORIZED: "Your are not authorized",
};

exports.categories_get_all = async (req, res) => {
  // let userRole = req.userInfo.userRole.toLowerCase();
  // let accessCheck = access.checkEntitlements(userRole);
  // if(accessCheck === false) {
  //     res.json({ err: errors.NOT_AUTHORIZED });
  //     return;
  // }

  var cachedData = await cacheManager.getCachedData("categoryData");

  if (!!cachedData) {
    if (cachedData.length > 0) {
      res.json(cachedData);
      return;
    }
  }

  Category.find({})
    //.sort({displayName: 1})
    .then((result) => {
      //cacheManager.setCachedData("categoryData", result)
      console.log(result);
      sortData.sort(result, "displayName");
      cacheManager.setCachedData("categoryData", result);

      res.json(result);
    })
    .catch((err) => {
      res
        .status(500)
        .json({ success: false, msg: `Something went wrong. ${err}` });
    });
};

exports.categories_post = async (req, res) => {
  let userRole = req.userInfo.userRole.toLowerCase();
  let accessCheck = access.checkEntitlements(userRole);
  if (accessCheck === false) {
    res.json({ err: errors.NOT_AUTHORIZED });
    return;
  }
  let newCategory = new Category({
    sequence: req.body.sequence,
    title: req.body.title.toLowerCase(),
    displayName: req.body.displayName,
    show: req.body.show,
  });
  if (req.body._id) {
    Category.findById(req.body._id, function (err, p) {
      if (err) {
        res.send(err);
      }
      // var res = getCategoryById(p, req.body);

      // res.json(res);
      var oldResult = {
        title: p.title,
        displayName: p.displayName,
        sequence: p.sequence,
        show: p.show,
        sequence: p.sequence,
      };

      p.title = req.body.title;
      p.displayName = req.body.displayName;
      p.sequence = req.body.sequence;
      p.show = req.body.show;
      p.save()
        .then((result) => {
          cacheManager.clearCachedData("categoryData");
          let userIdToken = req.userInfo.userName;
          let fields = [];
          var res1 = Object.assign({}, result);
          for (let keys in res1._doc) {
            if (keys !== "id" && keys !== "_id") {
              fields.push(keys);
            }
          }
          fields.filter((field) => {
            if (oldResult[field] !== result[field]) {
              audit.insertAuditLog(
                oldResult[field],
                result.id,
                "Category",
                field,
                result[field],
                userIdToken,
                ""
              );
            }
          });

          res.json({
            success: true,
            msg: `Successfully Updated!`,
            result: {
              _id: result._id,
              title: result.title,
              displayName: result.displayName,
              sequence: result.sequence,
              show: result.show,
            },
          });
        })
        .catch((err) => {
          if (err.errors) {
            // Show failed if all else fails for some reasons
            res
              .status(500)
              .json({ success: false, msg: `Something went wrong. ${err}` });
          }
        });
    });
  } else {
    newCategory
      .save()
      .then((result) => {
        cacheManager.clearCachedData("categoryData");
        let userIdToken = req.userInfo.userName;
        let fields = [];
        var res1 = Object.assign({}, result);
        for (let keys in res1._doc) {
          if (keys !== "id" && keys !== "_id") {
            fields.push(keys);
          }
        }

        fields.filter((field) => {
          if (
            result[field] !== "" &&
            result[field] !== null &&
            result[field] !== undefined
          )
            audit.insertAuditLog(
              "",
              result.id,
              "Category",
              field,
              result[field],
              userIdToken,
              ""
            );
        });

        res.json({
          success: true,
          msg: `Successfully added!`,
          result: {
            _id: result._id,
            title: result.title,
            displayName: result.displayName,
            show: result.show,
            sequence: result.sequence,
          },
        });
      })
      .catch((err) => {
        if (err.errors) {
          // Show failed if all else fails for some reasons
          res
            .status(500)
            .json({ success: false, msg: `Something went wrong. ${err}` });
        }
      });
  }
};

exports.categories_put = (req, res) => {
  let userRole = req.userInfo.userRole.toLowerCase();
  let accessCheck = access.checkEntitlements(userRole);
  if (accessCheck === false) {
    res.json({ err: errors.NOT_AUTHORIZED });
    return;
  }
  let updatedCategory = {
    _id: req.params.id,
    sequence: req.body.sequence,
    title: req.body.title,
    displayName: req.body.displayName,
    show: req.body.show,
  };

  Category.findOneAndUpdate({ _id: req.params.id }, updatedCategory, {
    context: "query",
  })
    .then((oldResult) => {
      Category.findOne({ _id: req.params.id })
        .then((newResult) => {
          let userIdToken = req.userInfo.userName;
          let fields = [];
          var res1 = Object.assign({}, oldResult);
          for (let keys in res1._doc) {
            if (keys !== "id" && keys !== "_id") {
              fields.push(keys);
            }
          }
          fields.filter((field) => {
            if (oldResult[field] !== newResult[field]) {
              audit.insertAuditLog(
                oldResult[field],
                newResult.id,
                "Category",
                field,
                newResult[field],
                userIdToken,
                ""
              );
            }
          });
          res.json({
            success: true,
            msg: `Successfully updated!`,
          });
        })
        .catch((err) => {
          res
            .status(500)
            .json({ success: false, msg: `Something went wrong. ${err}` });
          return;
        });
    })
    .catch((err) => {
      if (err.errors) {
        // Show failed if all else fails for some reasons
        res
          .status(500)
          .json({ success: false, msg: `Something went wrong. ${err}` });
      }
    });
};

exports.categories_delete = (req, res) => {
  let userRole = req.userInfo.userRole.toLowerCase();
  let accessCheck = access.checkEntitlements(userRole);
  if (accessCheck === false) {
    res.json({ err: errors.NOT_AUTHORIZED });
    return;
  }
  Category.findOneAndRemove({ _id: req.body.id })
    .then((result) => {
      cacheManager.clearCachedData("categoryData");
      let userIdToken = req.userInfo.userName;
      let field = "";
      var res1 = Object.assign({}, result);
      for (let keys in res1._doc) {
        if (keys === "title") {
          field = keys;
        }
      }
      audit.insertAuditLog(
        result[field],
        result.id,
        "Category",
        field,
        "",
        userIdToken,
        ""
      );

      res.json({
        success: true,
        msg: `It has been deleted.`,
        result: {
          _id: result._id,
          title: result.title,
          displayName: result.displayName,
          show: result.show,
        },
      });
    })
    .catch((err) => {
      res.status(404).json({ success: false, msg: "Nothing to delete." });
    });
};

const getCategoryById = (p, data) => {
  var jsonResponse;
  var oldResult = {
    title: p.title,
    displayName: p.displayName,
    show: p.show,
    sequence: p.sequence,
  };

  p.title = data.title;
  p.displayName = data.displayName;
  p.show = data.show;
  p.save()
    .then((result) => {
      cacheManager.clearCachedData("categoryData");
      let userIdToken = data.userName;
      let fields = [];
      var res1 = Object.assign({}, result);
      for (let keys in res1._doc) {
        if (keys !== "id" && keys !== "_id") {
          fields.push(keys);
        }
      }
      fields.filter((field) => {
        if (oldResult[field] !== result[field]) {
          audit.insertAuditLog(
            oldResult[field],
            result.id,
            "Category",
            field,
            result[field],
            userIdToken,
            ""
          );
        }
      });

      jsonResponse = {
        success: true,
        msg: `Successfully Updated!`,
        result: {
          _id: result._id,
          title: result.title,
          displayName: result.displayName,
          sequence: result.sequence,
          show: result.show,
        },
      };
    })
    .catch((err) => {
      if (err.errors) {
        // Show failed if all else fails for some reasons
        jsonResponse = { success: false, msg: `Something went wrong. ${err}` };
      }
    });

  return jsonResponse;
};
