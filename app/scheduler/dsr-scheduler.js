const axios = require('axios');
const express = require('express');
var schedule = require('node-schedule');
const config = require('./config');
const nodemailer = require('nodemailer');
const {
    logError,
    logInfo
} = require('../server/common/logger.js');
const {
    sendEmail
} = require('../server/common/mailer');
const dateUtil = require('../server/utils/date-util');

var j = schedule.scheduleJob(config.dsrNotificationSchedule, function () {

    logInfo('dsrNotificationSchedule started');
    axios({
            method: 'get',
            responseType: 'json',
            headers: {
                'token': config.tokenKey
            },
            url: config.url + '/dsrScheduler/getdata',

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
                    logInfo('dsrNotificationSchedule received data from service');
                    let data = response.data.data;
                    let users = response.data.users;
                    let holiday = resp.data.holiday;
                    let currdt = new Date();
                    var holidayList = [];
                    let isSend = false;
                    let statusData = [{
                            id: "new",
                            displayName: "New"
                        },
                        {
                            id: "inprogress",
                            displayName: "In Progress"
                        },
                        {
                            id: "completed",
                            displayName: "Completed"
                        },
                        {
                            id: "onHold",
                            displayName: "On Hold"
                        }
                    ]

                    for (let i = 0; i < holiday.length; i++) {
                        let dtarr = [];

                        dtarr.push('holiday[i].year')
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
                        users.forEach((u) => {

                            let userMailInfo = [];
                            for (let i = 0; i < data.length; i++) {
                                let taskList = (data[i].taskDetails.length > 0) && data[i].taskDetails.filter((t) => {
                                    return u._id === t.userId;
                                })

                                if (taskList.length > 0) {

                                    let tasklist = taskList.map((t) => {
                                        let statuS = statusData.filter((s) => {
                                            return t.status === s.id;
                                        })
                                        let task = {
                                            title: t.title,
                                            description: t.description,
                                            status: (statuS.length > 0) ? statuS[0].displayName : "",
                                            storyPoint: t.storyPoint,
                                            endDate: t.endDate,
                                            subtasks: t.subtasks,
                                            messages: t.messages,
                                            dateOfCompletion: t.dateOfCompletion
                                        }
                                        return task;
                                    })

                                    let userData = {
                                        projectTitle: data[i].projectTitle,
                                        tasks: tasklist,
                                        ownerEmails: data[i].ownerEmail
                                    }
                                    userMailInfo.push(userData);
                                }
                            }

                            if (userMailInfo.length > 0) {

                                let text = "";
                                let notifyOwners = [];
                                for (let i = 0; i < userMailInfo.length; i++) {
                                    let taskData = "";

                                    let tasks = userMailInfo[i].tasks;
                                    for (let j = 0; j < tasks.length; j++) {

                                        let subtask = "";

                                        if (tasks[j]["subtasks"].length > 0) {

                                            let subtaskS = "";
                                            for (let x = 0; x < tasks[j]["subtasks"].length; x++) {
                                                subtaskS += "<li>" + tasks[j]["subtasks"][x] + "</li>";
                                            }

                                            subtask = "<b>Subtasks</b> : <ul>" + subtaskS + "</ul></li>"
                                        }

                                        let messages = "";

                                        if (tasks[j]["messages"].length > 0) {
                                            tasks[j]["messages"].sort((a, b) => (a.createdOn < b.createdOn));
                                            let messageS = "";
                                            for (let y = 0; y < tasks[j]["messages"].length; y++) {
                                                messageS += "<li>" + tasks[j]["messages"][y].title + "<br/> by " + tasks[j]["messages"][y].createdBy + " - " + tasks[j]["messages"][y].createdOn +
                                                    "</li>";
                                            }
                                            messages = "<b>Messages</b> : <ol>" + messageS + "</ol></li><br/> "

                                        }

                                        let endDate = "";
                                        if (tasks[j]["endDate"] !== "") {

                                            let currentDate = dateUtil.DateToString(new Date());

                                            if (tasks[j]["endDate"] < currentDate) {
                                                let overdueDays = "";
                                                let completedDate = dateUtil.DateToString(tasks[j]["dateOfCompletion"]);
                                                if (tasks[j]["status"] === 'completed' && completedDate !== '') {

                                                    overdueDays = parseInt((new Date(completedDate) - new Date(tasks[j]["endDate"])) / (1000 * 60 * 60 * 24));
                                                } else {
                                                    overdueDays = parseInt((new Date(currentDate) - new Date(tasks[j]["endDate"])) / (1000 * 60 * 60 * 24));
                                                }

                                                endDate = "<b>Task End Date</b> : " + tasks[j]["endDate"] + "<span style=\"color: red;\"> (Overdue " + overdueDays + " day(s)) </span><br/>"
                                            } else {
                                                endDate = "<b>Task End Date</b> : " + tasks[j]["endDate"] + "<br/>"
                                            }
                                        }

                                        let description = tasks[j]["description"].split("\n").join("<br/> &nbsp; &nbsp; &nbsp; &nbsp; ");

                                        taskData +=
                                            "<br/><li><b>Task Title</b> : " + tasks[j]["title"] + "<br/>" +
                                            "<b>Task Description</b> : " + description + "<br/>" +
                                            "<b>Task Status</b> : " + tasks[j]["status"] + "<br/>" +
                                            "<b>Task Story Point</b> : " + tasks[j]["storyPoint"] + "<br/>" +
                                            endDate +
                                            subtask +
                                            messages
                                    }

                                    text += "<ul>" +
                                        "<br/><li><b> Project Title</b> : " + userMailInfo[i]["projectTitle"] + "<br/>" +
                                        "<b>Tasks</b> : <br/><ul>" + taskData + "</ul></li>" +

                                        "</ul>";
                                    if (userMailInfo[i].ownerEmails.length > 0)
                                        for (let k = 0; k < userMailInfo[i].ownerEmails.length; k++) {
                                            if (!notifyOwners.includes(userMailInfo[i].ownerEmails[k])) {
                                                notifyOwners.push(userMailInfo[i].ownerEmails[k]);
                                            }
                                        }
                                }
                                let date = dateUtil.DateToString(new Date());
                                var mailOptions = {
                                    from: config.from,
                                    to: u.email,
                                    cc: notifyOwners.join(","),
                                    subject: 'DSR ' + date + " - " + u.name,
                                    html: "Below are today's activities of <b> " + u.name + "</b> : <br/> " + text + " <br/><br/> " +
                                        "<br/><br/> Thanks, <br/> proPeak Team <br /><a href='" + config.link + "'>proPeak</a>" +
                                        "<br/>This is a system generated mail. Please do not reply to this."

                                };
                                mails.push(mailOptions);
                            }

                        });
                        let emailToBeSentCount = mails.length,
                            emailSentCount = 0,
                            sendEmailInterval = null;

                        let batchEmailSend = () => {
                            for (let i = 0; emailSentCount <= emailToBeSentCount && i < config.emailBatchSize; ++i) {
                                let mailOptions = mails[emailSentCount];
                                let response = sendEmail(mailOptions);

                                if (response.response) {
                                    logInfo(response, 'dsrNotificationSchedule - Error occured while sending email ' + mailOptions.to);
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

                                        })
                                    logInfo(response, 'dsrNotificationSchedule - An e-mail has been sent to ' + mailOptions.to + ' with further instructions.');
                                }
                                ++emailSentCount;
                            }
                            if (emailToBeSentCount <= emailSentCount) {
                                logInfo('dsrNotificationSchedule completed. All emails sent');
                                clearInterval(sendEmailInterval);
                                return;
                            }
                        }
                        if (emailToBeSentCount > 0) {
                            sendEmailInterval = setInterval(batchEmailSend, config.emailBatchWaitTime);
                        }
                        logInfo('dsrNotificationSchedule completed');

                    }
                })
                .catch((err) => {
                    logError("dsrScheduler err", err);
                });
        });
});