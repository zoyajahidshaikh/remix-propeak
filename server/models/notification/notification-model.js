import mongoose from 'mongoose';
const Schema = mongoose.Schema;
//const {HideNotification,HideNotificationSchema} = require('./hidenotification');

// Define the database model
const NotificationSchema = new mongoose.Schema({
    notification: {
        type: String
    },
    shownotifications: [],
    toDate: {
        type: String
    },
    fromDate: {
        type: String
    },
    isDeleted: {
        type: Boolean
    },
    hidenotifications:[],
    projectId:{
        type: String
    },
    // userIds:[]

}, {
    collection: 'notification'
}, { versionKey: false });

const Notification = module.exports = mongoose.model('notification', NotificationSchema);