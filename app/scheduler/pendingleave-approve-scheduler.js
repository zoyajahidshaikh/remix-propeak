const axios = require('axios');
var schedule = require('node-schedule');
const config = require('./config');
const { logError, logInfo } = require('../server/common/logger.js');
const { sendEmail } = require('../server/common/mailer');
const dateUtil = require('../server/utils/date-util');
const LeaveApplication = require('../server/models/leave/leave-model')
//const LeaveApplication = require('../../models/leave/leave-model');
const User = require('../server/models/user/user-model')
//const User = require('../../models/user/user-model');

try {
    const j = schedule.scheduleJob(config.pendingLeaveapproveSchedule, function () {
        console.log('PendingLeaveApprovedIncompleteSchedule started');
        logInfo('PendingLeaveApprovedIncompleteSchedule started');

        axios({
            method: 'get',
            responseType: 'json',
            headers: {
                'token': config.tokenKey
            },
            url: config.url + '/pendingleaveapprovescheduler/getpendingleaveapprovedata',

        })
            .then(async (response) => {
                console.log(response);
                //logInfo(response, 'PendingLeaveApprovedcompleteSchedule response');
            })
            .catch((err) => {
                console.log(err);
                //logInfo(err, 'PendingLeaveApprovedIncompleteSchedule exception ');
            });

    })
}
catch (e) {
    console.log(e, "PendingLeaveApprovedIncompleteSchedule");
}

