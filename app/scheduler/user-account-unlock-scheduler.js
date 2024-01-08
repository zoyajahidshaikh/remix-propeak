const axios = require('axios');
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

try {
    var j = schedule.scheduleJob(config.userAccountUnlockSchedule, function () {
        //console.log("UserAccountUnlockAschedule started");
        axios({
            method: 'get',
            responseType: 'json',
            headers: {
                'token': config.tokenKey
            },
            url: config.url + '/userAccountUnlockScheduler/getdata',

        })
            .then(async (response) => {
                logInfo(response.data.data, 'UserAccountUnlockAschedule response');
                //console.log("UserAccountUnlockAschedule Res", response.data.data);

            })
            .catch((err) => {
                // console.log(err);
                logInfo(err, 'UserAccountUnlockAschedule exception ');
            });
    })

    //leave notification mail sending           
    var K = schedule.scheduleJob(config.leaveNotificationSchedule, function () {
        console.log("LeaveNotification started");
        axios({
            method: 'get',
            responseType: 'json',
            headers: {
                'token': config.tokenKey
            },
            url: config.url + '/userAccountUnlockScheduler/getleavedata',

        })
            .then(async (response) => {
                logInfo(response.data, 'LeaveNotification response');
                let data = response.data;
                let cols = Object.keys(data)
                let mails = [];
                let rows = '';
                let colData = '';
                let colss = [];
                for (let i = 0; i < cols.length; i++){
                    let leaveD = data[cols[i]]
                    let leaveLists = leaveD.map((t) => {
                        return t
                    })
                    let colValue = (leaveLists && leaveLists.length > 0) ? leaveLists[0] : ''
                    colss = Object.keys(colValue).filter((f) => {
                        return f === 'userName' || f === 'fromDate' || f === 'toDate'
                    });
                  
                }
                var coloumns = []
                for (let k = 0; k < colss.length; k++) {
                    let data2 = colss[k].replace(/([A-Z])/g, ' $1').trim();
                    let data1 = data2.charAt(0).toUpperCase() + data2.slice(1);
                    colData += '<th style="border: 1px solid black">' + data1 + '</th>'
                    coloumns.push(colss[k]);
                }
                cols.forEach((u) => {
                   let leaveD = data[u]
                    let leaveLists = leaveD.map((t) => {
                        return t
                    })
                    let colss = [];
                    var rows = "";

                    for (let i = 0; i < leaveLists.length; i++) {
                        let tableRows = ''
                        for (let j = 0; j < coloumns.length; j++) {
                            tableRows += '<td style="border: 1px solid black">' + leaveLists[i][coloumns[j]] + '</td>'
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
                        to: u,
                        subject: 'Leave Reminder',
                        html: 'Hi, <br>  Below are leave List: <br><br> ' + tdata +
                            '<br><br> Thanks, <br> proPeak Team <br />'
                    };
                    mails.push(mailOptions);
                    
                })
                let emailToBeSentCount = mails.length;
                    emailSentCount = 0,
                    sendEmailInterval = null;
                let batchEmailSend = () => {
                    for (let i = 0; emailSentCount <= emailToBeSentCount && i < config.emailBatchSize; ++i) {
                     
                        let mailOptions = mails[emailSentCount];
                        let response = sendEmail(mailOptions);
                        if (response.response) {
                            logInfo(response, 'LeaveNotificationschedule - Error occured while sending email ' + mailOptions.to);

                        } 
                        ++emailSentCount;
                    }
                    if (emailToBeSentCount <= emailSentCount) {
                        logInfo('LeaveNotificationschedule completed.  All emails sent');
                        clearInterval(sendEmailInterval);
                        return;
                    }  
                }
                if (emailToBeSentCount > 0) {
                    sendEmailInterval = setInterval(batchEmailSend, config.emailBatchWaitTime);
                }

            })
            .catch((err) => {
                logInfo(err, 'LeaveNotificationschedule exception ');
            });
    })
}


catch (e) {
    logInfo(e, "LeaveNotification`schedule");
}
