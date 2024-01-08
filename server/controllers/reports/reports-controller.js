const mongoose = require('mongoose');
const Project = require('../../models/project/project-model');
const Task = require('../../models/task/task-model');
const User = require('../../models/user/user-model');
const Token = require('../../models/Token/token');
const Company = require('../../models/company/company-model');
const { logError, logInfo } = require('../../common/logger');
const access = require('../../check-entitlements');
const dateUtil = require('../../utils/date-util');
const accessConfig = require('../../common/validate-entitlements');
const Holiday = require("../../models/leave/holiday-model");
const countDays = require('../../common/common');
const daysInYears = require('../../common/common');
const daysInMonths = require('../../common/common');
const Burndown = require('../../models/burndown/burndown-model');
const config = require("../../config/config");
const LeaveApplication = require('../../models/leave/leave-model');
const { ObjectId } = require('mongodb');
const totalSundays = require('../../common/common');

const errors = {
    "SEARCH_PARAM_MISSING": "Please input either Year and Month /From and To for search",
    "SERVER_ERROR": "Opps, something went wrong. Please try again.",
    "NOT_AUTHORIZED": "Your are not authorized",
    "SEARCH_PARAMETER_MISSING":'Please Select Both Year and Month '
};

exports.getMonthlyTaskReport = ((req, res) => {
    try {
        logInfo("getMonthlyTaskReport userInfo=");
        logInfo(req.userInfo, "getMonthlyTaskReport userInfo=");
        logInfo(req.body, "getMonthlyTaskReport");
        let projectId = req.body.projectId;
        let {
            year,
            month,
            dateFrom,
            dateTo
        } = req.body.reportParams;
        let userRole = req.userInfo.userRole.toLowerCase();
        let userId = req.userInfo.userId;

        let accessCheck = access.checkEntitlements(userRole);
        let userAccess = req.userInfo.userAccess;
        let getTaskReportAccess = false;
        getTaskReportAccess = accessConfig.validateEntitlements(userAccess, req.body.projectId, 'Task Report', 'view',userRole);
        if (accessCheck === false && !getTaskReportAccess) {
            res.json({ err: errors.NOT_AUTHORIZED });
            return;
        }
        let projects = [];
        let condition = {};

        let projectFields = { $project: { _id: 1, title: 1, userid: 1, projectUsers: 1, "tasks.title": 1, "tasks._id": 1, "tasks.userId": 1, "tasks.description": 1, "tasks.storyPoint": 1, "tasks.startDate": 1, "tasks.endDate": 1, "tasks.isDeleted": 1, "tasks.category": 1, "tasks.status": 1 } };
        let unwindTasks = { $unwind: "$tasks" };
        let projectCondition = "";

        if (dateFrom === '' && dateTo === '') {
            condition = {
                $and: [{
                    "tasks.startDate": {
                        '$gte': new Date(year, month, 1)
                    }
                }, {
                    "tasks.startDate": {
                        '$lte': new Date(year, 1 + parseInt(month, 10), 1)
                    }
                }],
                "tasks.isDeleted": false
            };
        } else if ((year === '' || parseInt(year, 10) === -1) && (month === '' || parseInt(month, 10) === -1)) {

            condition = {
                $and: [{
                    "tasks.startDate": {
                        '$gte': new Date(dateFrom)
                    }
                }, {
                    "tasks.startDate": {
                        '$lte': new Date(dateTo)
                    }
                }],
                "tasks.isDeleted": false
            };
        } else {
            res.json({
                err: errors.SEARCH_PARAM_MISSING
            });
            return;
        }
        let taskFilterCondition = {
            $match: condition
        };
        let userCondition = {
            isDeleted: false
        };
        if (userRole === "owner") {
            userCondition.userid = userId;
        }
        let projectCond = {};
        if (projectId) {
            projectCond = {
                $match: {
                    _id: mongoose.Types.ObjectId(projectId)
                }
            };
        } else {
            projectCond = {
                $match: userCondition
            };
        }

        logInfo([projectCond, projectFields, unwindTasks, taskFilterCondition], "getMonthlyTaskReport filtercondition=");
        Project.aggregate([projectCond, projectFields, unwindTasks, taskFilterCondition])
            .then((result) => {
                let tasks = result.map((p) => {
                    let assignedUser = p.projectUsers.filter((u) => u.userId === p.tasks.userId);
                    let userName = (assignedUser && Array.isArray(assignedUser) && assignedUser.length > 0) ? assignedUser[0].name : "";
                    let task = {
                        projectId: p._id,
                        userId: p.tasks.userId,
                        userName: userName,
                        projectTitle: p.title,
                        title: p.tasks.title,
                        description: p.tasks.description,
                        category: p.tasks.category,
                        status: p.tasks.status,
                        storyPoint: p.tasks.storyPoint,
                        startDate: p.tasks.startDate,
                        endDate: p.tasks.endDate
                    }
                    return task;
                });
                logInfo("before response getMonthlyTaskReport tasks=");
                res.json({
                    success: true,
                    data: (tasks && tasks.length > 0) ? tasks : ""
                });
            })
            .catch((err) => {
                res.json({
                    err: errors.SERVER_ERROR
                });
            });
    } catch (e) {
        logError(e, "getMonthlyTaskReport error");
    }
})

exports.getMonthlyUserReport = ((req, res) => {
    try {
        logInfo("getMonthlyUserReport userInfo=");
        logInfo(req.userInfo, "getMonthlyUserReport userInfo=");
        logInfo(req.body, "getMonthlyUserReport");
        let projectId = req.body.projectId;
        let {
            year,
            month,
            dateFrom,
            dateTo,
            userId
        } = req.body.reportParams;
        let userRole = req.userInfo.userRole.toLowerCase();
        let loggedInUserId = req.userInfo.userId;

        let accessCheck = access.checkEntitlements(userRole);
        if (accessCheck === false) {
            res.json({ err: errors.NOT_AUTHORIZED });
            return;
        }
        let projects = [];
        let condition = {};

        let projectFields = {
            $project: {
                _id: 1,
                title: 1,
                userid: 1,
                "tasks.title": 1,
                "tasks._id": 1,
                "tasks.userId": 1,
                "tasks.startDate": 1,
                "tasks.endDate": 1,
                "tasks.isDeleted": 1,
                "tasks.status": 1,
                "tasks.storyPoint": 1,
                "tasks.messages": 1,
                "tasks.dateOfCompletion": 1
            }
        };
        let unwindTasks = {
            $unwind: "$tasks"
        };
        let projectCondition = "";

        if (dateFrom === '' && dateTo === '') {
            condition = {
                $and: [{
                    "tasks.startDate": {
                        '$gte': new Date(year, month, 1)
                    }
                }, {
                    "tasks.startDate": {
                        '$lte': new Date(year, 1 + parseInt(month, 10), 1)
                    }
                }],
                "tasks.isDeleted": false,
                "tasks.userId": userId
            };
        } else if ((year === '' || parseInt(year, 10) === -1) && (month === '' || parseInt(month, 10) === -1)) {

            condition = {
                $and: [{
                    "tasks.startDate": {
                        '$gte': new Date(dateFrom)
                    }
                }, {
                    "tasks.startDate": {
                        '$lte': new Date(dateTo)
                    }
                }],
                "tasks.isDeleted": false,
                "tasks.userId": userId
            };
        } else {
            res.json({
                err: errors.SEARCH_PARAM_MISSING
            });
            return;
        }
        let taskFilterCondition = {
            $match: condition
        };
        let userCondition = {
            isDeleted: false
        };
        if (userRole === "owner") {
            userCondition.userid = loggedInUserId;
        }
        let projectCond = {};
        if (projectId) {
            projectCond = {
                $match: {
                    _id: mongoose.Types.ObjectId(projectId)
                }
            };
        } else {
            projectCond = {
                $match: userCondition
            };
        }

        logInfo([projectCond, projectFields, unwindTasks, taskFilterCondition], "getMonthlyTaskReport filtercondition=");
        Project.aggregate([projectCond, projectFields, unwindTasks, taskFilterCondition])
            .then((result) => {
                let tasks = result.map((p) => {
                    // let assignedUser=p.projectUsers.filter((u)=>u.userId===p.tasks.userId);
                    // let userName=(assignedUser && Array.isArray(assignedUser) && assignedUser.length>0) ? assignedUser[0].name:"";
                    let messages = (p.tasks.messages.length > 0) && p.tasks.messages.map((m, i) => {
                        let msg = "";
                        msg += (i + 1) + ". " + m.title + " - " + dateUtil.DateToString(m.createdOn);
                        return msg;
                    })
                    let overdueDays = 0;
                    let currentDate = new Date();

                    if (p.tasks.status === 'completed') {
                        overdueDays = parseInt((new Date(dateUtil.DateToString(p.tasks.dateOfCompletion)) - new Date(dateUtil.DateToString(p.tasks.endDate))) / (1000 * 60 * 60 * 24));
                    } else if (p.tasks.endDate < currentDate) {
                        overdueDays = parseInt((new Date(dateUtil.DateToString(currentDate)) - new Date(dateUtil.DateToString(p.tasks.endDate))) / (1000 * 60 * 60 * 24));
                    }

                    let task = {
                        projectId: p._id,
                        userId: p.tasks.userId,
                        // userName:userName,
                        projectTitle: p.title,
                        title: p.tasks.title,
                        taskId: p.tasks._id,
                        // description: p.tasks.description,
                        // category:p.tasks.category,
                        dateOfCompletion: p.tasks.dateOfCompletion,
                        status: p.tasks.status,
                        storyPoint: p.tasks.storyPoint,
                        startDate: p.tasks.startDate,
                        endDate: p.tasks.endDate,
                        overdueDays: overdueDays,
                        messages: messages
                    }
                    return task;
                });
                logInfo("before response getMonthlyUserReport tasks=");
                res.json({
                    success: true,
                    data: tasks
                });
            })
            .catch((err) => {
                res.json({
                    err: errors.SERVER_ERROR
                });
            });
    } catch (e) {
        logError(e, "getMonthlyUserReport error");
    }
})




exports.getActiveUsersReport = ((req, res) => {
    Token.find({}, { userId: 1 }).then
        ((result) => {
            var userIds = [];
            for (let i = 0; i < result.length; i++) {
                userIds.push(result[i].userId);
            }
            User.find({
                _id: {
                    $in: userIds
                },
                isDeleted: false
            }, { "name": 1, "email": 1, "companyId": 1 })
                .then((result) => {
                    var companyIds = [];
                    let resultStore = [];
                    for (let i = 0; i < result.length; i++) {
                        if (result[i].companyId !== "") {
                            companyIds.push(result[i].companyId);
                        }

                    }

                    Company.find({
                        _id: {
                            $in: companyIds
                        },
                        isDeleted: false
                    }, { "companyId": 1, "companyName": 1 })
                        .then((result1) => {
                            for (let i = 0; i < result.length; i++) {

                                if (result[i].companyId !== "") {

                                    for (let j = 0; j < result1.length; j++) {
                                        if (result[i].companyId === result1[j]._id.toString()) {
                                            let obj = {
                                                name: result[i].name,
                                                email: result[i].email,
                                                companyName: result1[j].companyName
                                            }

                                            resultStore.push(obj);
                                            break;
                                        }
                                    }
                                }
                            }
                            return res.json(resultStore);
                        })

                })
        })
})
exports.getUserTaskCountReport = ((req, res) => {
    try {
        logInfo("getUserTaskCountReport userInfo=");
        logInfo(req.userInfo, "getUserTaskCountReport userInfo=");
        logInfo(req.body, "getUserTaskCountReport");
        let {
            year,
            month,
            userId
        } = req.body.reportParams;
        let userRole = req.userInfo.userRole.toLowerCase();
        let loggedInUserId = req.userInfo.userId;

        let accessCheck = access.checkEntitlements(userRole);
        if (accessCheck === false) {
            res.json({
                err: errors.NOT_AUTHORIZED
            });
            return;
        }
        let projects = [];
        let condition = {};

        let projectFields = {
            $project: {
                _id: 1,
                "tasks.title": 1,
                "tasks._id": 1,
                "tasks.userId": 1,
                // "tasks.startDate": 1,
                // "tasks.endDate": 1,
                "tasks.isDeleted": 1,
                "tasks.storyPoint": 1,
                //"tasks.status": 1,
                "tasks.dateOfCompletion": 1
            }
        };
        let unwindTasks = {
            $unwind: "$tasks"
        };
        if (userId === undefined || userId === null || userId === '') {
            if ((month === '' || parseInt(month, 10) === -1)) {
                condition = {
                    $and: [{
                        "tasks.dateOfCompletion": {
                            $ne: undefined
                        }
                    }, {
                        "tasks.dateOfCompletion": {
                            $ne: null
                        }
                    }, {
                        "tasks.dateOfCompletion": {
                            $ne: ''
                        }
                    },
                    {
                        "tasks.dateOfCompletion": {
                            '$gt': new Date(year, 0, 1).toISOString()
                        }
                    }, {
                        "tasks.dateOfCompletion": {
                            '$lte': new Date(year, 1 + parseInt(10), 31 + 1).toISOString()
                        }
                    }
                    ],

                    "tasks.isDeleted": false,
                }
            } else {
                condition = {
                    $and: [{
                        "tasks.dateOfCompletion": {
                            $ne: undefined
                        }
                    }, {
                        "tasks.dateOfCompletion": {
                            $ne: null
                        }
                    }, {
                        "tasks.dateOfCompletion": {
                            $ne: ''
                        }
                    },
                    {
                        "tasks.dateOfCompletion": {
                            '$gt': new Date(year, month - 1, 1).toISOString()
                        }
                    }, {
                        "tasks.dateOfCompletion": {
                            '$lte': new Date(year, parseInt(month, 10), 1).toISOString()
                        }
                    }
                    ],
                    "tasks.isDeleted": false,
                }
            }
        } else {
            if ((month === '' || parseInt(month, 10) === -1)) {
                condition = {
                    $and: [{
                        "tasks.dateOfCompletion": {
                            $ne: undefined
                        }
                    }, {
                        "tasks.dateOfCompletion": {
                            $ne: null
                        }
                    }, {
                        "tasks.dateOfCompletion": {
                            $ne: ''
                        }
                    },
                    {
                        "tasks.dateOfCompletion": {
                            '$gt': new Date(year, 0, 1).toISOString()
                        }
                    }, {
                        "tasks.dateOfCompletion": {
                            '$lte': new Date(year, 1 + parseInt(10), 31 + 1).toISOString()
                        }
                    }
                    ],
                    "tasks.userId": userId,
                    "tasks.isDeleted": false,
                }
            } else {
                condition = {
                    $and: [{
                        "tasks.dateOfCompletion": {
                            $ne: undefined
                        }
                    }, {
                        "tasks.dateOfCompletion": {
                            $ne: null
                        }
                    }, {
                        "tasks.dateOfCompletion": {
                            $ne: ''
                        }
                    },
                    {
                        "tasks.dateOfCompletion": {
                            '$gt': new Date(year, month - 1, 1).toISOString()
                        }
                    }, {
                        "tasks.dateOfCompletion": {
                            '$lte': new Date(year, parseInt(month, 10), 1).toISOString()
                        }
                    }
                    ],
                    "tasks.userId": userId,
                    "tasks.isDeleted": false,
                }
            }

        }

        let taskFilterCondition = {
            $match: condition
        };
        let groupCondition = {
            $group: {
                _id: "$userId",
                storyPoint: {
                    $sum: Number('$storyPoint')
                },
                count: {
                    $sum: 1
                }
            }
        }
        let userCondition = {
            isDeleted: false
        };
        let projectCond = {};
        projectCond = {
            $match: userCondition
        };
        // groupCondition
        logInfo([projectCond, projectFields, unwindTasks, taskFilterCondition], "getUserTaskCountReport filtercondition=");
        Project.aggregate([projectCond, projectFields, unwindTasks, taskFilterCondition])
            .then((result) => {
                //console.log("result data check", result);
                let storyPoint
                let taskCount = 0
                let userTaskCount
                let tasksByuserId = {}

                if ((month === '' || parseInt(month, 10) === -1)) {
                    Holiday.find({
                        "year": year,
                        "isActive": "1"
                    })
                        .then((result1) => {
                            let holidayCount = result1 && result1.length;
                            let count = countDays.getDays('Sunday', year, 'year')
                            let totalSundayCount = count.length;
                            //let minWorkingHours = 9;
                            let totalCount = holidayCount + totalSundayCount;
                            let daysInYear = daysInYears.daysInYear(year)
                            let workingHours = (daysInYear - totalCount) * config.minWorkingHours;
                            if (result.length > 0) {

                                for (let i = 0; i < result.length; i++) {
                                    if (result[i].tasks.userId !== undefined && result[i].tasks.userId !== null && result[i].tasks.userId !== '') {
                                        if (tasksByuserId[result[i].tasks.userId]) {
                                            storyPoint = tasksByuserId[result[i].tasks.userId].storyPoint + result[i].tasks.storyPoint;
                                            userTaskCount = tasksByuserId[result[i].tasks.userId].taskCount + 1;

                                            let percentage = (storyPoint / workingHours) * 100;
                                            tasksByuserId[result[i].tasks.userId].storyPoint = storyPoint
                                            tasksByuserId[result[i].tasks.userId].taskCount = userTaskCount
                                            tasksByuserId[result[i].tasks.userId].taskCount = userTaskCount
                                            tasksByuserId[result[i].tasks.userId].percentage = percentage.toFixed(2)

                                        }
                                        else {
                                            storyPoint = 0;
                                            userTaskCount = 0;
                                            storyPoint = storyPoint + result[i].tasks.storyPoint;
                                            userTaskCount = userTaskCount + 1
                                            tasksByuserId[result[i].tasks.userId] = { storyPoint: storyPoint, taskCount: userTaskCount, workingHours: workingHours };
                                        }
                                    }
                                }
                            }
                            let tasks = []
                            tasks.push(tasksByuserId)

                            logInfo("before response getUserTaskCountReport tasks=");
                            res.json({
                                success: true,
                                data: tasks
                            });
                        })
                } else {
                    Holiday.find({
                        "month": month,
                        "isActive": "1"
                    })
                        .then((result1) => {
                            let holidayCount = result1 && result1.length;
                            let monthvalue = (month < 10) ? ('0' + month):month
                            let count = totalSundays.sundaysInMonth(monthvalue, year)
                            let totalSundayCount = count.length;
                            //let minWorkingHours = 9;
                            let totalCount = holidayCount + totalSundayCount;
                            // console.log("totalCount", totalCount);
                            let daysInMonth = daysInMonths.daysInMonth(month, year)
                            // console.log("daysInMonth", daysInMonth);
                            let workingHours = (daysInMonth - totalCount) * config.minWorkingHours;

                            if (result.length > 0) {

                                for (let i = 0; i < result.length; i++) {
                                    if (result[i].tasks.userId !== undefined && result[i].tasks.userId !== null && result[i].tasks.userId !== '') {
                                        if (tasksByuserId[result[i].tasks.userId]) {
                                            storyPoint = tasksByuserId[result[i].tasks.userId].storyPoint + result[i].tasks.storyPoint;
                                            userTaskCount = tasksByuserId[result[i].tasks.userId].taskCount + 1;

                                            let percentage = (storyPoint / workingHours) * 100;
                                            tasksByuserId[result[i].tasks.userId].storyPoint = storyPoint
                                            tasksByuserId[result[i].tasks.userId].taskCount = userTaskCount
                                            tasksByuserId[result[i].tasks.userId].taskCount = userTaskCount
                                            tasksByuserId[result[i].tasks.userId].percentage = percentage.toFixed(2)

                                        }
                                        else {
                                            storyPoint = 0;
                                            userTaskCount = 0;
                                            storyPoint = storyPoint + result[i].tasks.storyPoint;
                                            userTaskCount = userTaskCount + 1
                                            tasksByuserId[result[i].tasks.userId] = { storyPoint: storyPoint, taskCount: userTaskCount, workingHours: workingHours };
                                        }
                                    }
                                }

                            }
                            let tasks = []
                            tasks.push(tasksByuserId)

                            logInfo("before response getUserTaskCountReport tasks=");
                            res.json({
                                success: true,
                                data: tasks
                            });
                        })
                }

            })
            .catch((err) => {
                res.json({
                    err: errors.SERVER_ERROR
                });
            });
    } catch (e) {
        logError(e, "getUserTaskCountReport error");
    }
})

exports.getIncompleteTaskCountReport = ((req, res) => {
    let userCondition = {
        isDeleted: false
    };
    let projectCond = {};
    projectCond = {
        $match: userCondition
    };
    let projectFields = {
        $project: {
            _id: 1,
            "tasks.title": 1,
            "tasks._id": 1,
            "tasks.userId": 1,
            "tasks.startDate": 1,
            "tasks.endDate": 1,
            "tasks.isDeleted": 1,
            "tasks.status": 1,
            "tasks.storyPoint": 1,
            "tasks.dateOfCompletion": 1
        }
    };
    let unwindTasks = {
        $unwind: "$tasks"
    };
    condition = {
        $or: [
            {
                "tasks.status": { $eq: 'new' }
            },
            {
                "tasks.status": { $eq: 'inprogress' }
            }
        ],
        "tasks.isDeleted": false
    };
    let taskFilterCondition = {
        $match: condition
    };
    try {
        Project.aggregate([projectCond, projectFields, unwindTasks, taskFilterCondition])
            .then((result) => {
                tasksByuserId = {}
                let newtaskCount
                let inprogresstaskCount

                if (result.length > 0) {
                    for (let i = 0; i < result.length; i++) {
                        if (result[i].tasks.userId !== '') {
                            if (tasksByuserId[result[i].tasks.userId]) {
                                if (result[i].tasks.status === 'new') {
                                    newtaskCount = tasksByuserId[result[i].tasks.userId].newtaskCount + 1;
                                }
                                else {
                                    inprogresstaskCount = tasksByuserId[result[i].tasks.userId].inprogresstaskCount + 1
                                }
                                tasksByuserId[result[i].tasks.userId].newtaskCount = newtaskCount
                                tasksByuserId[result[i].tasks.userId].inprogresstaskCount = inprogresstaskCount

                            }
                            else {
                                newtaskCount = 0;
                                inprogresstaskCount = 0;
                                if (result[i].tasks.status === 'new') {
                                    newtaskCount = 1
                                }
                                else {
                                    inprogresstaskCount = 1
                                }
                                newtaskCount = newtaskCount;
                                inprogresstaskCount = inprogresstaskCount
                                //console.log("newtaskCount",newtaskCount);
                                // console.log("inprogresstaskCount",inprogresstaskCount);
                                tasksByuserId[result[i].tasks.userId] = { newtaskCount: newtaskCount, inprogresstaskCount: inprogresstaskCount };
                            }
                        }
                    }
                    //console.log("newtaskCount",newtaskCount);
                    // console.log("inprogresstaskCount", inprogresstaskCount);
                    //console.log("tasksByuserId", tasksByuserId);
                    let tasks = []
                    tasks.push(tasksByuserId)
                    res.json({
                        data: tasks
                    })
                }

            })
            .catch((err) => {
                res.json({
                    err: errors.SERVER_ERROR
                });
            });
    }

    catch (e) {
        logError(e, "getUserTaskCountReport error");
    }
})

exports.getProjectProgressReport = ((req, res) => {
    try {
        Burndown.find({ projectId: req.body.projectId })
            .then((result) => {
                let resultArray = [];
                if (result.length > 0) {
                    for (let i = 0; i < result.length; i++) {
                        let d1 = new Date(result[i].date);
                        let date = dateUtil.DateToString((d1.getFullYear()) + '-' + (d1.getMonth() + 1) + '-' + (d1.getDate()))

                        let info = {
                            projectId: result[i].projectId,
                            todo: result[i].todo,
                            inprogress: result[i].inprogress,
                            completed: result[i].completed,
                            todoStoryPoint: result[i].todoStoryPoint,
                            inprogressStoryPoint: result[i].inprogressStoryPoint,
                            completedStoryPoint: result[i].completedStoryPoint,
                            date: date
                        }
                        resultArray.push(info)
                    }
                }

                res.json({
                    data: resultArray
                })

            })
            .catch((err) => {
                res.json({
                    err: errors.SERVER_ERROR
                });
            });
    }

    catch (e) {
        logError(e, "getProjectProgressReport error");
    }
})


exports.getUserPerformanceReport = ((req, res) => {
    try {
        // console.log("req", req.body);
        let userId = req.body.userId;
        let projectId = req.body.projectId;
        let year = req.body.year;
        let month = req.body.month;
        let dateFrom = req.body.dateFrom;
        let dateTo = req.body.dateTo;
        let projectFields = {
            $project: {
                _id: 1,
                title: 1,
                userid: 1,
                status: 1,
                "tasks.title": 1,
                "tasks._id": 1,
                "tasks.userId": 1,
                "tasks.description": 1,
                "tasks.startDate": 1,
                "tasks.endDate": 1,
                "tasks.isDeleted": 1,
                "tasks.category": 1,
                "tasks.status": 1,
                "tasks.completed": 1,
                "tasks.dateOfCompletion": 1,
                "tasks.storyPoint": 1
            }
        };
        let taskCondition = {
            "tasks.status": { $ne: 'onHold' },
            $and: [{
                "tasks.endDate": {
                    $ne: undefined
                }
            }, {
                "tasks.endDate": {
                    $ne: null
                }
            }, {
                "tasks.endDate": {
                    $ne: ''
                }
            }],
            "tasks.isDeleted": false,
            "tasks.userId": userId
        }
        if (userId && (year === '' || parseInt(year, 10) === -1) && (month === '' || parseInt(month, 10) === -1) && dateFrom === '' && dateTo === '') {
            taskCondition = taskCondition
        }
        else if (userId && dateFrom === '' && dateTo === '' && (year !== '' || parseInt(year, 10) !== -1) && (month !== '' || parseInt(month, 10) !== -1)) {
            taskCondition["tasks.startDate"] = {
                '$gte': new Date(year, month, 1),
                '$lte': new Date(year, 1 + parseInt(month, 10), 1)
            }
        }
        else if (userId && (year === '' || parseInt(year, 10) === -1) && (month === '' || parseInt(month, 10) === -1) && dateFrom !== '' && dateTo !== '') {

            taskCondition["tasks.startDate"] = {
                '$gte': new Date(dateFrom),
                '$lte': new Date(dateTo)
            }
        }
        else {
            res.json({
                err: errors.SEARCH_PARAM_MISSING
            });
            return
        }
       
      
        let projCondition = {
            isDeleted: false
        };
        if (projectId) {
            projCondition["_id"] = ObjectId(projectId);
        }
        let projectCond = {
            $match: projCondition
        };
        let tasksUnwind = {
            $unwind: "$tasks"
        };
        let taskFilterCondition = {
            $match: taskCondition
        };

        let group = {
            $group: {
                _id: {
                    _id: '$_id',
                    title: '$title',
                    taksTitle: '$tasks.title',
                    userId: '$tasks.userId',
                    status: '$tasks.status',
                    dateOfCompletion: '$tasks.dateOfCompletion',
                    category: '$tasks.category',
                    startDate: '$tasks.startDate',
                    endDate: '$tasks.endDate',
                    storyPoint: '$tasks.storyPoint'
                },
                count: {
                    $sum: 1
                },

            }
        };
        logInfo([projectCond, projectFields, tasksUnwind, taskFilterCondition, group], "getUserPerformanceReport")
        Project.aggregate([projectCond, projectFields, tasksUnwind, taskFilterCondition, group])
            .then((result) => {
                let projectCountArray = []
                // if (result.length > 0) {
                    let tasksByProjectId = {};
                    let date = dateUtil.DateToString(new Date());

                    for (let i = 0; i < result.length; i++) {

                        let completedCount = 0;
                        let todoCount = 0;
                        let inprogressCount = 0;
                        let storyPoint = 0;
                        let overDueCount = 0

                        if (tasksByProjectId[result[i]._id._id]) {

                            if (result[i]._id.status === 'completed') {

                                tasksByProjectId[result[i]._id._id].completed += result[i].count;
                                let dbDate = dateUtil.DateToString(result[i]._id.endDate);
                                let dateOfCompletion = dateUtil.DateToString(result[i]._id.dateOfCompletion);
                                if (dbDate < dateOfCompletion) {
                                    overDueCount++
                                }
                            } else if (result[i]._id.status === 'new') {

                                tasksByProjectId[result[i]._id._id].todo += result[i].count;
                                let dbDate = dateUtil.DateToString(result[i]._id.endDate);
                                if (dbDate < date) {
                                    overDueCount++
                                }
                            } else {

                                tasksByProjectId[result[i]._id._id].inprogress += result[i].count;
                                let dbDate = dateUtil.DateToString(result[i]._id.endDate);
                                if (dbDate < date) {
                                    overDueCount++
                                }
                            }
                            tasksByProjectId[result[i]._id._id].overDue += overDueCount;
                            tasksByProjectId[result[i]._id._id].storyPoint += result[i]._id.storyPoint;

                        } else {
                            if (result[i]._id.status === 'completed') {
                                completedCount = result[i].count;
                                let dbDate = dateUtil.DateToString(result[i]._id.endDate);
                                let dateOfCompletion = dateUtil.DateToString(result[i]._id.dateOfCompletion);
                                if (dbDate < dateOfCompletion) {
                                    overDueCount++
                                }

                            } else if (result[i]._id.status === 'new') {
                                todoCount = result[i].count;
                                let dbDate = dateUtil.DateToString(result[i]._id.endDate);
                                if (dbDate < date) {
                                    overDueCount++
                                }

                            } else {
                                inprogressCount = result[i].count;
                                let dbDate = dateUtil.DateToString(result[i]._id.endDate);
                                if (dbDate < date) {
                                    overDueCount++
                                }

                            }
                            storyPoint = result[i]._id.storyPoint
                            tasksByProjectId[result[i]._id._id] = {
                                projectId: result[i]._id._id,
                                title: result[i]._id.title,
                                todo: todoCount,
                                inprogress: inprogressCount,
                                completed: completedCount,
                                storyPoint: storyPoint,
                                overDue: overDueCount,
                                userId: result[i]._id.userId
                            };
                        }
                    }
                    // console.log("tasksByProjectId", tasksByProjectId);
                    let keys = Object.keys(tasksByProjectId)

                    for (let i = 0; i < keys.length; i++) {
                        let projectObj = {
                            Completed: tasksByProjectId[keys[i]].completed,
                            Todo: tasksByProjectId[keys[i]].todo,
                            Inprogress: tasksByProjectId[keys[i]].inprogress,
                            Storypoint: tasksByProjectId[keys[i]].storyPoint,
                            Overdue: tasksByProjectId[keys[i]].overDue,
                            projectId: tasksByProjectId[keys[i]].projectId,
                            title: tasksByProjectId[keys[i]].title
                        }
                        projectCountArray.push(projectObj)
                    }
                    //leave count
                let leaveArray = []
                let leaveCondition = {};

                if (dateFrom === '' && dateTo === '') {
                    leaveCondition = {
                        isDeleted: false,
                        userId: userId,
                    }
                }
                else {
                    leaveCondition = {
                        isDeleted: false,
                        userId: userId,
                        fromDate: {
                            '$gte': dateUtil.DateToString(dateFrom),
                            '$lte': dateUtil.DateToString(dateTo)

                        }
                    }
                }
                    LeaveApplication.find(
                        leaveCondition
                    , {
                            "_id": 1,
                            "userId": 1,
                            "userName": 1,
                            "leaveType": 1,
                            "isDeleted": 1,
                            "status": 1,
                            fromDate:1
                        })
                        .then((result1) => {
                           
                            if (result1.length > 0) {
                                let totalLeave = 0;
                                let unApprvedLeaveCount = 0;
                                let unpaidLeaveCount = 0;
                                let sickLeaveCount = 0;
                                let casualLeaveCount = 0;
                                let compoffLeaveCount = 0;
                                let maternityLeaveCount = 0;
                                let paternityLeaveCount = 0;
                                let leaveObj = {};
                                let obj1,obj2,obj3,obj4,obj5,obj6,obj7,obj8
                                for (let i = 0; i < result1.length; i++) {
                                    
                                            totalLeave = result1.length
                                            if (result1[i].status === 'pending') {
                                                unApprvedLeaveCount++;
                                            }
                                            if (result1[i].leaveType === "Sick Leave") {
                                                sickLeaveCount++;
                                            }
                                            if (result1[i].leaveType === 'Casual Leave') {
                                                casualLeaveCount++;
                                            }
                                            if (result1[i].leaveType === 'Un-paid') {
                                                unpaidLeaveCount++;
                                            }
                                            if (result1[i].leaveType === 'Maternity Leave') {
                                                maternityLeaveCount++;
                                            }
                                            if (result1[i].leaveType === 'Comp Off') {
                                                compoffLeaveCount++;
                                            }
                                            if (result1[i].leaveType === 'Paternity Leave') {
                                                paternityLeaveCount++;
                                            }
                                       
                                   
                                    leaveObj = {
                                        TotalLeave: totalLeave,
                                        UnapprovedLeaveCount: unApprvedLeaveCount,
                                        UnpaidLeaveCount: unpaidLeaveCount,
                                        SickLeaveCount: sickLeaveCount,
                                        CasualLeaveCount: casualLeaveCount,
                                        CompoffLeaveCount: compoffLeaveCount,
                                        MaternityLeaveCount: maternityLeaveCount,
                                        PaternityLeaveCount: paternityLeaveCount
                                    }
                                    // obj1={
                                    //     name:"Total Leave",
                                    //     count:totalLeave
                                    // }
                                    obj2={
                                        name: "Unapproved",
                                        count:unApprvedLeaveCount
                                    }
                                    obj3={
                                        name: "Unpaid",
                                        count:unpaidLeaveCount
                                    }
                                    obj4={
                                        name: "Sick",
                                        count:sickLeaveCount
                                    }
                                    obj5={
                                        name: "Casual",
                                        count:casualLeaveCount
                                    }
                                    obj6={
                                        name: "Compoff",
                                        count:compoffLeaveCount
                                    }
                                    obj7={
                                        name: "Maternity",
                                        count:maternityLeaveCount
                                    }
                                    obj8={
                                        name: "Paternity",
                                        count:paternityLeaveCount
                                    }
                                 

                                }
                                // leaveArray.push(leaveObj);
                                // leaveArray.push(obj1);
                                leaveArray.push(obj2);
                                leaveArray.push(obj3);
                                leaveArray.push(obj4);
                                leaveArray.push(obj5);
                                leaveArray.push(obj6);
                                leaveArray.push(obj7);
                                leaveArray.push(obj8);

                            }
                            // console.log("leaveArray", leaveArray);
                            // if (result1.length > 0) {
                            //     let totalLeave = 0;
                            //     let unApprvedLeaveCount = 0;
                            //     let unpaidLeaveCount = 0;
                            //     let sickLeaveCount = 0;
                            //     let casualLeaveCount = 0;
                            //     let compoffLeaveCount = 0;
                            //     let maternityLeaveCount = 0;
                            //     let paternityLeaveCount = 0
                            //     for (let i = 0; i < result1.length; i++) {

                            //         totalLeave = result1.length
                            //         if (result1[i].status === 'pending') {
                            //             unApprvedLeaveCount++;
                            //         }
                            //         if (result1[i].leaveType === "Sick Leave") {
                            //             sickLeaveCount++;
                            //         }
                            //         if (result1[i].leaveType === 'Casual Leave') {
                            //             casualLeaveCount++;
                            //         }
                            //         if (result1[i].leaveType === 'Un-paid') {
                            //             unpaidLeaveCount++;
                            //         }
                            //         if (result1[i].leaveType === 'Maternity Leave') {
                            //             maternityLeaveCount++;
                            //         }
                            //         if (result1[i].leaveType === 'Comp Off') {
                            //             compoffLeaveCount++;
                            //         }
                            //         if (result1[i].leaveType === 'Paternity Leave') {
                            //             paternityLeaveCount++;
                            //         }



                            //     }
                            //     let leaveObj = {
                            //         TotalLeave: totalLeave,
                            //         UnapprovedLeaveCount: unApprvedLeaveCount,
                            //         UnpaidLeaveCount: unpaidLeaveCount,
                            //         SickLeaveCount: sickLeaveCount,
                            //         CasualLeaveCount: casualLeaveCount,
                            //         CompoffLeaveCount: compoffLeaveCount,
                            //         MaternityLeaveCount: maternityLeaveCount,
                            //         PaternityLeaveCount: paternityLeaveCount
                            //     }

                            //     leaveArray.push(leaveObj);
                            //     console.log("leaveArray", leaveArray);
                            // }
                            // let countArray=[]
                            // for (let i = 0; i < leaveArray.length; i++){
                            //     if (leaveArray[i].TotalLeave>=0) {
                            //         countArray.push({ 'name': 'Total Leave', 'value': leaveArray[i].TotalLeave })
                            //     }
                            //     if (leaveArray[i].UnapprovedLeaveCount >= 0) {
                            //         countArray.push({ 'name': 'Unapproved Leave Count', 'value': leaveArray[i].UnapprovedLeaveCount })
                            //     }
                            //     if (leaveArray[i].UnpaidLeaveCount >= 0) {
                            //         countArray.push({ 'name': 'Unpaid Leave Count', 'value': leaveArray[i].UnpaidLeaveCount })
                            //     }
                            //     if (leaveArray[i].SickLeaveCount >= 0) {
                            //         countArray.push({ 'name': 'Sick Leave Count', 'value': leaveArray[i].SickLeaveCount})
                            //     }
                            //     if (leaveArray[i].CasualLeaveCount >= 0) {
                            //         countArray.push({ 'name': 'Casual Leave Count', 'value': leaveArray[i].CasualLeaveCount})
                            //     }
                            //     if (leaveArray[i].CompoffLeaveCount >= 0) {
                            //         countArray.push({ 'name': 'Compoff Leave Count', 'value': leaveArray[i].CompoffLeaveCount})
                            //     }
                            //     if (leaveArray[i].MaternityLeaveCount >= 0) {
                            //         countArray.push({ 'name': 'Maternity Leave Count', 'value': leaveArray[i].MaternityLeaveCount })
                            //     }
                            //     if (leaveArray[i].PaternityLeaveCount >= 0) {
                            //         countArray.push({ 'name': 'Paternity Leave Count', 'value': leaveArray[i].PaternityLeaveCount})
                            //     }

                                
                            // }
                            // console.log("projectCountArray", projectCountArray);
                            let projectData = []
                            let completedTotal = 0;
                            let inprogressTotal = 0;
                            let overdueTotal = 0;
                            let storypointTotal = 0;
                            let todoTotal = 0
                            for (let i = 0; i < projectCountArray.length; i++){
                               
                                if (projectCountArray[i].Completed>=0) {
                                    completedTotal += projectCountArray[i].Completed   
                                }
                                if (projectCountArray[i].Inprogress>=0) {
                                    inprogressTotal += projectCountArray[i].Inprogress
                                }
                                if (projectCountArray[i].Overdue>=0) {
                                    overdueTotal += projectCountArray[i].Overdue;
                                }
                                if (projectCountArray[i].Storypoint >= 0) {
                                    storypointTotal += projectCountArray[i].Storypoint;

                                }
                                if (projectCountArray[i].Todo >= 0) {
                                    todoTotal += projectCountArray[i].Todo;
                                }
                               
                              
                            }
                            projectData.push(
                                { name: 'Completed', value: completedTotal },
                                { name: 'Todo', value: todoTotal },
                                { name: 'Storypoint', value: storypointTotal },
                                { name: 'Overdue', value: overdueTotal },
                                { name: 'Inprogress', value: inprogressTotal }
                            )
                            // console.log("projectData", projectData);
                            res.json({
                                projectListData: projectData,
                                leaveData: leaveArray,
                                projectTableData: projectCountArray
                            })
                        })
                // }
                // else {
                //     res.json({
                //         projectListData: [],
                //         leaveData:[]
                //     }); 
                // }

            })
            .catch((err) => {
                res.json({
                    err: errors.SERVER_ERROR
                });
            });
    }
    catch (e) {
        console.log(e)
    }
});