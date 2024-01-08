const axios = require('axios');
const express = require('express');
var schedule = require('node-schedule');
const config = require('./config');
const nodemailer = require('nodemailer');
const { logError, logInfo } = require('../server/common/logger.js');
const { sendEmail } = require('../server/common/mailer');
const dateUtil = require('../server/utils/date-util');

try {
    var j = schedule.scheduleJob(config.burndownSchedule, function () {
        logInfo('taskIncompleteCountSchedule started');
        axios({
            method: 'get',
            responseType: 'json',
            headers: {
                'token': config.tokenKey
            },
            url: config.url + '/burndown/getdata',

        })
            .then(async (response) => {
                logInfo(response.data.projects, 'taskIncompleteCountSchedule response');
                //console.log("Res", response.data.projects);
                // console.log("Res length", response.data.projects.length);
            })
            .catch((err) => {
                // console.log(err);
                logInfo(err, 'taskIncompleteCountSchedule exception ');
            });
    })
}
catch (e) {
    logInfo(e, "taskIncompleteCountSchedule");
}