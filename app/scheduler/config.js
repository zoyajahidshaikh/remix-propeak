
module.exports = Object.freeze({
    url: "http://localhost:3001/api",
    host: 'smtp.gmail.com',
    serverPort: 3001,
    fromEmail: 'propeakpms@gmail.com',
    link: 'http://172.104.176.113:3000/',
    taskStatusNotificationSchedule: '*/30 * * * * 1-6',
    dsrNotificationSchedule: '*/30 * * * * 1-6',
    clearTokenSchedule: '*/30 * * * * 1-6',
    projectAutoCloneSchedule: '30 48 18 * * 1-6',
    emailSchedule: '*/1 * * * *',
    emailBatchSize: 5,
    emailBatchWaitTime: 60000,
    tokenKey: '123',
    companyCode: 'Algo_',
    burndownSchedule: '*/30 * * * * 1-6',
    userAccountUnlockSchedule: '*/1 * * * * *',
    dailySummaryReportSchedule: '30 51 10 * * 1-6',
    leaveNotificationSchedule: '*/30 * * * * 1-6',
    pendingLeaveapproveSchedule: '00 30 11 * * 2-7'  

});