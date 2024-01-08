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

var j = schedule.scheduleJob(config.dailySummaryReportSchedule, function () {
    try {
        logInfo('dailySummaryReportSchedule started');
        axios({
            method: 'get',
            responseType: 'json',
            headers: {
                'token': config.tokenKey
            },
            url: config.url + '/dailySummaryReportScheduler/getdata',

        })

            .then((response) => {


                logInfo('dailySummaryReportSchedule received data from service');
                let data = response.data;
                // console.log("data", data);
                let keys = Object.keys(data);

                let mails = [];
                for (let i = 0; i < keys.length; i++) {
                    let value = data[keys[i]];
                    // console.log("value", value);
                    let cols = Object.keys((value && value.length > 0) ? value[0][0] : {});
                    // console.log("cols", cols);
                    var colData = '';
                    for (let i = 0; i < cols.length; i++) {
                        // if (cols[i] !== '_id') {
                        let header = cols[i].replace(/([A-Z])/g, ' $1').trim();
                        let header1 = header.charAt(0).toUpperCase() + header.slice(1);
                        colData += '<th style="border: 1px solid black">' + header1 + '</th>'
                        // }
                    }
                    // console.log("colData", colData);
                    // console.log("value[0]", value[0]);
                    let rows = '';
                    for (let i = 0; i < value.length; i++) {
                        // console.log("value", value[i]);

                        for (let k = 0; k < value[i].length; k++) {
                            // console.log("value[i][k]", value[i][k]);
                            let tableRows = ''
                            for (let j = 0; j < cols.length; j++) {
                                tableRows += '<td style="border: 1px solid black">' + value[i][k][cols[j]] + '</td>'
                            }
                            // console.log("tableRows", tableRows);
                            rows += '<tr>' + tableRows + '</tr>';
                        }

                    }
                    // console.log("rows", rows);
                    var tdata =
                        '<html><table style="border:1px solid black"><thead><tr>' +
                        colData +
                        '<tr></thead><tbody>' +
                        rows +
                        '</tbody></table></html>';

                    // console.log("tdata", tdata);

                    var mailOptions = {
                        from: config.fromEmail,
                        to: keys[i],
                        subject: 'Daily Summary Report - ' + dateUtil.DateToString(new Date()),
                        html: 'Hi, <br>  Below is the daily summary report of overdue tasks: <br><br> ' + tdata +
                        '<br><br> Thanks, <br> proPeak Team <br /><a href="' + config.link + '">proPeak</a>'
                    };

                    mails.push(mailOptions);

                }

                console.log("mails", mails);
                let emailToBeSentCount = mails.length,
                    emailSentCount = 0,
                    sendEmailInterval = null;

                let batchEmailSend = () => {
                    logInfo('dailySummaryReportSchedule sending email');
                    for (let i = 0; emailSentCount <= emailToBeSentCount && i < config.emailBatchSize; ++i) {
                        let mailOptions = mails[emailSentCount];
                        let response = sendEmail(mailOptions);
                        if (response.response) {
                            // console.log("response mail not sent!", response);
                            logInfo(response, 'dailySummaryReportSchedule - Error occured while sending email ' + mailOptions.to);

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
                                    // console.log("response.data.msg mail sent ", response.data.msg);

                                })
                            logInfo(response, 'dailySummaryReportSchedule - An e-mail has been sent to ' + mailOptions.to + ' with further instructions.');



                        }
                        ++emailSentCount;
                    }
                    if (emailToBeSentCount <= emailSentCount) {
                        logInfo('dailySummaryReportSchedule completed.  All emails sent');
                        clearInterval(sendEmailInterval);
                        return;
                    }
                }
                if (emailToBeSentCount > 0) {
                    sendEmailInterval = setInterval(batchEmailSend, config.emailBatchWaitTime);
                }


            })
            .catch((err) => {
                logError("dsrScheduler err", err);
            });
    }
    catch (err) {
        logError("dsrScheduler err", err);
    }
});
