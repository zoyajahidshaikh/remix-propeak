const axios = require('axios');
const express = require('express');
var schedule = require('node-schedule');
const config = require('./config');
const nodemailer = require('nodemailer');
const { logError,logInfo} = require('../server/common/logger.js');
const { sendEmail} = require('../server/common/mailer');
const dateUtil = require('../server/utils/date-util');

try {
    var j = schedule.scheduleJob(config.taskStatusNotificationSchedule, function () {
        logInfo('taskStatusNotificationSchedule started');
        axios({
                method: 'get',
                responseType: 'json',
                headers: {
                    'token': config.tokenKey
                },
                url: config.url + '/scheduler/getdata',

            })
            .then(async (response) => {

                axios({
                        method: 'get',
                        responseType: 'json',
                        headers: {
                            'token': config.tokenKey
                        },
                        url: config.url + '/holiday/getholiday',

                    })
                    .then((resp) => {
                        logInfo('taskStatusNotificationSchedule received data from service');
                        let holiday = resp.data.holiday;
                        let currdt = new Date();
                        if (response.data.projects !== undefined) {
                            var projects = [];
                            var users = [];
                            var tasks = [];
                            var userIds = [];
                            var holidayList = [];
                            projects = response.data.projects;
                            // let holiday = response.data.holiday;
                            if (projects !== undefined || projects !== null) {
                                var cols = [];
                                cols = Object.keys(projects);
                            }
                            for (let i = 0; i < holiday.length; i++) {
                                let dtarr = [];
                                dtarr.push(holiday[i].year)
                                dtarr.push(holiday[i].date)
                                dtarr.push(holiday[i].month)

                                let dt = dtarr.join("-");
                                let dtarr1 = ''
                                dtarr1 = holiday[i].year + '-' + holiday[i].month + '-' + holiday[i].date
                                let newDate = dateUtil.DateToString(dtarr1)

                                holidayList.push(newDate);
                            }
                            let currentDate = `${currdt.getFullYear()}-${currdt.getMonth() + 1}-${currdt.getDate()}`
                            let date = dateUtil.DateToString(currentDate);
                            if (holidayList.indexOf(date) === -1) {


                                let mails = [];
                                var colData1 = '<th style="border: 1px solid black">Project</th>';

                                cols.forEach((u) => {
                                    let project = projects[u]
                                    let taskLists = project.tasks.map((t) => {
                                        return t
                                    })
                                    var tableRows1 = '<td style="border: 1px solid black">' + project.projectTitle + '</td>'

                                    let cols = [];
                                    var rows = "";
                                    let colValue = (taskLists && taskLists.length > 0) ? taskLists[0] : ''
                                    cols = Object.keys(colValue);

                                    var coloumns = []
                                    var colData = ''
                                    for (let i = 0; i < cols.length; i++) {

                                        if (cols[i] !== '_id') {
                                            let data = cols[i].replace(/([A-Z])/g, ' $1').trim();
                                            let data1 = data.charAt(0).toUpperCase() + data.slice(1);
                                            colData += '<th style="border: 1px solid black">' + data1 + '</th>'
                                            coloumns.push(cols[i]);
                                        }
                                    }

                                    for (let i = 0; i < taskLists.length; i++) {
                                        let tableRows = ''
                                        for (let j = 0; j < coloumns.length; j++) {
                                            tableRows += '<td style="border: 1px solid black">' + taskLists[i][coloumns[j]] + '</td>'
                                        }

                                        rows += '<tr>' + tableRows + '</tr>';
                                    }

                                    var tdata =
                                        '<html><table style="border:1px solid black"><thead><tr>' +
                                        colData +
                                        '<tr></thead><tbody>' +
                                        rows +
                                        '</tbody></table></html>';

                                    var mailOptions = {
                                        from: config.fromEmail,
                                        to: projects[u].email,
                                        subject: 'Your Todays/Incomplete tasks ',
                                        html: 'Hi, <br>  Below are  your Todays/Incomplete tasks: <br><br> ' + tdata +
                                            '<br><br> Thanks, <br> proPeak Team <br /><a href="' + config.link + '">proPeak</a>'
                                    };

                                    mails.push(mailOptions);
                                });

                                let emailToBeSentCount = mails.length,
                                    emailSentCount = 0,
                                    sendEmailInterval = null;

                                let batchEmailSend = () => {
                                    //logInfo('taskStatusNotificationSchedule sending email');
                                    for (let i = 0; emailSentCount <= emailToBeSentCount && i < config.emailBatchSize; ++i) {
                                        let mailOptions = mails[emailSentCount];
                                        let response = sendEmail(mailOptions);
                                        if (response.response) {
                                            logInfo(response, 'taskStatusNotificationSchedule - Error occured while sending email ' + mailOptions.to);

                                        } else {
                                            axios({
                                                    method: 'post',
                                                    responseType: 'json',
                                                    headers: {
                                                        'token': config.tokenKey
                                                    },
                                                    url: config.url + '/dsrScheduler/updateLog',
                                                    data: mailOptions
                                                })
                                                .then((response) => {
                                                    // console.log("response.data.msg",response.data.msg);
                                                })
                                            logInfo(response, 'taskStatusNotificationSchedule - An e-mail has been sent to ' + mailOptions.to + ' with further instructions.');

                                        }
                                        ++emailSentCount;
                                    }
                                    if (emailToBeSentCount <= emailSentCount) {
                                        logInfo('taskStatusNotificationSchedule completed.  All emails sent');
                                        clearInterval(sendEmailInterval);
                                        return;
                                    }
                                }
                                if (emailToBeSentCount > 0) {
                                    sendEmailInterval = setInterval(batchEmailSend, config.emailBatchWaitTime);
                                }

                            }
                        }

                    })
                    .catch((err) => {
                        logInfo(err, 'taskStatusNotificationSchedule exception ');
                    });
            });
    });
} catch (e) {
    logInfo(e, 'taskStatusNotificationSchedule exception ');
}