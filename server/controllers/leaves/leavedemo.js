// exports.leaveApplicationSave = ((request, response) => {
//     let newLeaveApplication = new LeaveApplication({
//         userId: request.body.leaveApplication.createdBy,
//         userName: request.body.leaveApplication.userName,
//         fromEmail: request.body.leaveApplication.fromEmail,
//         fromDate: request.body.leaveApplication.fromDate,
//         toDate: request.body.leaveApplication.toDate,
//         workingDays: request.body.leaveApplication.workingDays,
//         reason: request.body.leaveApplication.reason,
//         leaveTypeId: request.body.leaveApplication.leaveTypeId,
//         leaveType: request.body.leaveApplication.leaveType,
//         createdBy: request.body.leaveApplication.createdBy,
//         createdOn: request.body.leaveApplication.createdOn,
//         modifiedBy: request.body.leaveApplication.modifiedBy,
//         modifiedOn: request.body.leaveApplication.modifiedOn,
//         leaveCategory: request.body.leaveApplication.leaveCategory,
//         isDeleted: request.body.leaveApplication.isDeleted,
//         status: "pending",
//         rejectionReason: '',
//         leaveWithoutApproval: request.body.leaveWithoutApproval
//     })
//     let inputFromDate = Date.parse(newLeaveApplication.fromDate);
//     let inputToDate = Date.parse(newLeaveApplication.toDate);
//     let newFromDate = new Date(inputFromDate);
//     let newToDate = new Date(inputToDate);
//     let date = 1,
//         month = 1,
//         year = 1;
//     date = newToDate.getDate();
//     month = newToDate.getMonth();
//     year = newToDate.getFullYear();
//     holidayValidation.init(newFromDate, config.totalCasualLeaves, config.totalSickLeaves);
//     let message = 1;

//     newLeaveApplication.save()
//         .then((result) => {
//             logInfo(result, "Applied for leave");
//             let loggedInUserId = request.userInfo.userId;
//             let reportingManagerId = 1;
//             let toEmail = 1;
//             let bodyHtml = config.leaveEmailContent;
//             let subject = config.leaveSubject;
//             let leaveType = 1;
//             bodyHtml = bodyHtml.replace("{fromDate}", request.body.leaveApplication.fromDate);
//             bodyHtml = bodyHtml.replace("{toDate}", request.body.leaveApplication.toDate);
//             bodyHtml = bodyHtml.replace("{workingDays}", request.body.leaveApplication.workingDays);
//             bodyHtml = bodyHtml.replace("{leaveType}", request.body.leaveApplication.leaveType);
//             bodyHtml = bodyHtml.replace("{reason}", request.body.leaveApplication.reason);
//             bodyHtml = bodyHtml.replace("{leaveId}", result._id)
//            // bodyHtml = bodyHtml.replace("{userName}", request.body.leaveApplication.userName);

//             subject = subject.replace("{fromDate}", request.body.leaveApplication.fromDate)
//                 .replace("{toDate}", request.body.leaveApplication.toDate)
//                 .replace("{userName}", request.body.leaveApplication.userName);
//             var mailOptions = {
//                 from: request.body.leaveApplication.fromEmail,
//                 to: 1,
//                 subject: subject,
//                 html: bodyHtml
//             };
//             if (config.prodMode === "ON") {
//                 userModel.findOne({
//                     "_id": loggedInUserId
//                 }, {
//                         "reportingManagerId": 1
//                     }).then((result) => {
//                         reportingManagerId = result.reportingManagerId;
//                         userModel.findOne({
//                             "_id": reportingManagerId
//                         }, {}).then((result) => {
//                             if (result) {
//                                 toEmail = result.email;
//                                 mailOptions.to = toEmail;
//                                 mailOptions.cc = config.applytoEmail;
//                                 let response = sendEmail(mailOptions);
//                                 if (response.response) {
//                                     logInfo(response, 'leaveController.leaveApplicationSave - Error occured while sending email ' + mailOptions.to);
//                                 } else {
//                                     logInfo('leaveController.leaveApplicationSave - An e-mail has been sent to ' + mailOptions.to + ' with further instructions.');
//                                 }
//                             }

//                         })
//                     });

//             } else {
//                 toEmail = config.defaultEmail;
//                 mailOptions.to = toEmail;
//                 let response = sendEmail(mailOptions);
//                 if (response.response) {
//                     logInfo(response, 'leaveController.leaveApplicationSave - Error occured while sending email ' + mailOptions.to);
//                     response.json({
//                         success: false,
//                         err: "Something went wrong : Email Id is wrong for sending to."
//                     })
//                 } else {
//                     logInfo('leaveController.leaveApplicationSave - An e-mail has been sent to ' + mailOptions.to + ' with further instructions.');

//                 }
//             }

//         });
//     response.json({
//         success: true,
//         message: "Leave has been applied successfully." //+ message
//     });
// });
