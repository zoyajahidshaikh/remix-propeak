module.exports = Object.freeze({
  UPLOAD_PATH: 'E:/Propeak-PMS/server',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: "propeakpms@gmail.com",
    pass: "algorisys"
  },
  link: 'http://172.104.176.113:3000/',
  from: 'propeakpms@gmail.com',
  serverPort: 3001,
   db: 'mongodb://localhost/propeakdb',
  // db: 'mongodb://propeak:pro123@localhost/tms',
  taskEmailContent: 'Hi, <br/> <br/> You have been assigned the following. task: <br/><br/> <b> Project </b> : #projectName# <br/> <b> Task </b> : #title#' +
    '<br/> <b> Priority </b> : #priority# <br/> <b> Description </b> : #description# <br/> <br/> To view task details, click <a href="http://172.104.176.113:3000/project/task/edit/#projectId#/#newTaskId#" alt="task">' +
    'here</a> or copy this URL on the browser  http://172.104.176.113:3000/project/task/edit/#projectId#/#newTaskId# <br/><br/> Thanks, <br/> proPeak Team',

  editlink: " http://172.104.176.113:3000/project/tasks/",
  servercert: '../cert/localhost.crt',
  servercertkey: '../cert/localhost.key',
  secureSite: true,
  securePort: 9000,
  tokenExpiry: 5000,
  refreshTokenExpiry: 3600000,
  msgLink: "http://172.104.176.113:3000/project/task/edit/",
  daysForMessageMail: 3,
  projectStatusCheck: ['inprogress', 'new', 'onHold'],

  socketPort: 3002,
  maxInprogressTaskCount: 2,
  defaultEmail: "sapana.shete@algorisys.com", //default emailId for sending the email
  leaveEmailContent: " //This is a system generated mail please do not reply this mail  <br> Dear Ma'am/Sir,<br><br> This is to inform you that I will not be able to attend office from <b>{fromDate}</b> to <b>{toDate}</b>.<br>Kindly grant me permission for <b>{workingDays}</b> day/s <b>{leaveType}.</b>.<br>Reason: {reason} <br>Please click on the following link, http://172.104.176.113:3000/leave-details/{leaveId} to view the leave details.<br><br> Thanks and Regards,<br> proPeak Team", //email Body
  leaveSubject: "Leave application {fromDate} to {toDate}- {userName}", // leave subject
  prodMode: "ON", //For testing purpose locally / after deploting on server 
  approveRejectEmailContent: "//This is a system generated mail please dont reply <br> Your Leave has been {leaveStatus} <br>Reason: {reasonOfRejection} <br> Thanks and Regards,<br> {loggedInUser}", //Email on the basis of acceptance and rejection
  approveRejectSubject: "Leave {status} - {fromDate}  to  {toDate}", //status on the basis of acceptance and rejection,
  holidayList: [],
  monthStart: 3,
  months: [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2],
  taskEmailLink: "/project/task/edit/#projectId#/#newTaskId#",
  msgEmailLink: "/project/task/edit/",
  redisClientPort: 6379,
  redisClientHost: '127.0.0.1',
  accessRightsExpiry: 2592000,

  rabbitMQ_exchangeName: 'ALGO_message_exch',
  rabbitMQ_connectionKey: 'amqp://localhost',
  taskStatusEmailContent: 'Hi, <br/> <br/> Task assigned to user is completed. task: <br/><br/> <b> Project </b> : #projectName# <br/> <b> Task </b> : #title#' +
    '<br/> <b> Priority </b> : #priority# <br/> <b> Description </b> : #description# <br/> <br/> To view task details, click <a href="http://172.104.176.113:3000/project/task/edit/#projectId#/#newTaskId#" alt="task">' +
    'here</a> or copy this URL on the browser  http://172.104.176.113:3000/project/task/edit/#projectId#/#newTaskId# <br/><br/> Thanks, <br/> proPeak Team',
  companyCode: 'Algo_',
  //emails: "dharmendra.singh@algorisys.com, rajesh@algorisys.com , radhika@algorisys.com"
  emails: "sapana.shete@algorisys.com",
  applytoEmail: 'rinkulata.pooniya@algorisys.com',
  loginAttemptCount: 5,
  //applytoEmail: "dharmendra.singh@algorisys.com",
  unLockAccountHour: 1,
  beforeThreeDay: 3,
  beforeSevenDay: 7,
  minWorkingHours: 8,
  showMessage: true,
  leaveLink: "http://172.104.176.113:3000/leave-details/",
  extentionFile: ['PDF', 'DOCX', 'PNG', 'JPEG', 'JPG', 'TXT', 'PPT', 'XLSX', 'XLS', 'PPTX'],
  projectCreation:'unLimited',
  taskCreation:'unLimited',
  userCreation:'unLimited',
  defaultProject:'Daily Task'
  //projectCreation:57,
  // taskCreation:2,
  //userCreation:54

});