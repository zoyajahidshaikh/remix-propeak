const mongoose = require("mongoose");
const Company = require("../../models/company/company-model");
const jwt = require("jsonwebtoken");
const { logError, logInfo } = require("../../common/logger");
const access = require("../../check-entitlements");
const sortData = require("../../common/common");
const cacheManager = require("../../redis");
const { Observable } = require("rxjs/Observable");
const { bindNodeCallback } = require("rxjs/observable/bindNodeCallback");
const { fromPromise } = require("rxjs/observable/fromPromise");
const errors = {
  COMPANY_DOESNT_EXIST: "Company does not exist",
  ADDCOMPANYERROR: "Error occurred while adding the company",
  EDITCOMPANYERROR: "Error occurred while updating the company",
  DELETECOMPANYERROR: "Error occurred while deleting the company",
  NOT_AUTHORIZED: "Your are not authorized",
};

//Get All Company
exports.getAllCompanies = async (req, res) => {
  // let userRole = req.userInfo.userRole.toLowerCase();
  // let accessCheck = access.checkEntitlements(userRole);
  // if(accessCheck === false) {
  //     res.json({ err: errors.NOT_AUTHORIZED });
  //     return;
  // }

  var cachedData = await cacheManager.getCachedData("companyData");

  if (!!cachedData) {
    if (cachedData.length > 0) {
      res.json(cachedData);
      return;
    }
  }

  let getAllCompanies = fromPromise(
    Company.find({ $or: [{ isDeleted: null }, { isDeleted: false }] })
  );
  getAllCompanies.subscribe(
    (result) => {
      // cacheManager.setCachedData("companyData", result);
      sortData.sort(result, "companyName");
      cacheManager.setCachedData("companyData", result);

      res.json(result);
    },
    (err) => {
      //console.log(err);
      res
        .status(500)
        .json({ success: false, msg: `Something went wrong. ${err}` });
    }
  );

  // Company.find({$or:[{isDeleted: null},{isDeleted:false}]})//.sort({companyName: 1})
  //   .then((result) => {
  //     cacheManager.setCachedData("companyData", result);
  //     var result1 = sortData.sort(result,'companyName');
  //     res.json(result);
  //   })
  //   .catch((err) => {
  //     res.status(500).json({ success: false, msg: `Something went wrong. ${err}` });
  //   });
};

//Get CompanyById
exports.getCompanyById = (req, res) => {
  let userRole = req.userInfo.userRole.toLowerCase();
  let accessCheck = access.checkEntitlements(userRole);
  if (accessCheck === false) {
    res.json({ err: errors.NOT_AUTHORIZED });
    return;
  }
  Company.find({ _id: req.params.id }).then((result) => {
    res.json({
      data: result,
    });
  });
};

// CREATE
exports.createCompany = (req, res) => {
  try {
    let userRole = req.userInfo.userRole.toLowerCase();
    let accessCheck = access.checkEntitlements(userRole);
    if (accessCheck === false) {
      res.json({ err: errors.NOT_AUTHORIZED });
      return;
    }
    logInfo(req.body, "createCompany");

    let newCompany = new Company(req.body);
    newCompany
      .save()
      .then((result) => {
        cacheManager.clearCachedData("companyData");
        logInfo(result, "createCompany result");
        res.json({
          success: true,
          msg: `Successfully added!`,
          result: result,
        });
      })
      .catch((err) => {
        if (err.errors) {
          res.json({ err: errors.ADDCOMPANYERROR });
        }
      });
  } catch (e) {
    logError(e, "createCompany e");
  }
};

exports.deleteCompany = (req, res) => {
  try {
    let userRole = req.userInfo.userRole.toLowerCase();
    let accessCheck = access.checkEntitlements(userRole);
    if (accessCheck === false) {
      res.json({ err: errors.NOT_AUTHORIZED });
      return;
    }
    logInfo(req.body, "deleteCompany");
    let updatedCompany = req.body;
    Company.findOneAndUpdate(
      { _id: updatedCompany[0]._id },
      { $set: { isDeleted: updatedCompany[0].isDeleted } }
    )
      .then((result) => {
        cacheManager.clearCachedData("companyData");
        logInfo(result, "deleteCompany result");
        res.json({
          success: true,
          msg: `Successfully Updated!`,
          result: result,
        });
      })
      .catch((err) => {
        if (err.errors) {
          res.json({ err: errors.DELETECOMPANYERROR });
        }
      });
  } catch (e) {
    logError(e, "deleteCompany e");
  }
};

exports.updateCompany = (req, res) => {
  try {
    let userRole = req.userInfo.userRole.toLowerCase();
    let accessCheck = access.checkEntitlements(userRole);
    if (accessCheck === false) {
      res.json({ err: errors.NOT_AUTHORIZED });
      return;
    }
    let updatedcompany = req.body;
    logInfo(req.body, "updateCompany");
    Company.findOneAndUpdate({ _id: req.body._id }, updatedcompany)
      .then((result) => {
        cacheManager.clearCachedData("companyData");
        logInfo(result, "updateCompany result");
        res.json({
          success: true,
          msg: `Successfully Updated!`,
          result: result,
        });
      })
      .catch((err) => {
        if (err.errors) {
          res.json({ err: errors.EDITCOMPANYERROR });
        }
      });
  } catch (e) {
    logError(e, "updateCompany e");
  }
};
