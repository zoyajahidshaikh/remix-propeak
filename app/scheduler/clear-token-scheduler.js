const axios = require('axios');
const express = require('express');
var schedule = require('node-schedule');
const config = require('./config');
const nodemailer = require('nodemailer');
const { logError, logInfo } = require('../server/common/logger.js');

try {
    var j = schedule.scheduleJob(config.clearTokenSchedule, function () {
        // console.log("clearTokenSchedule started");
        logInfo('clearTokenSchedule started');
        axios({
            method: 'get',
            responseType: 'json',
            headers: {
                'token': config.tokenKey
              },
            url: config.url + '/clearTokenScheduler/getdata', 
         
        })
            .then((response) => {
                // console.log("response",response);

                logInfo(response.data,"response.data");
           
            })
            .catch((err) => {
                // console.log(err);
                logInfo(err, 'clearTokenSchedule exception ');
            });
    });
}
catch (e) {
    // console.log(e);
    logInfo(e, 'clearTokenSchedule exception ');
}