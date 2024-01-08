import mongoose from 'mongoose';
// const Category = require('../models/category');
// const {User,UserSchema} = require('./user');
const {ProjectUsers,ProjectUserSchema} = require('../project/project-user-model');
const {NotifyUsers,NotifyUserSchema} = require('../user/notify-user-model');
const {UserGroups,UserGroupSchema} = require('../user/user-group-model');
const {Message,MessageSchema} = require('../message/message-model');
const {UploadFile,UploadFileSchema} = require('../upload-file/upload-file-model');
const {Tasks,TaskSchema} = require('../task/task-model');



// Define the database model
const ProjectSchema = new mongoose.Schema({
  title: {
    type: String
  },
  description: {
    type: String
  },
  startdate: {
    type: String
  },
  enddate: {
    type: String
  },
  status: {
    type: String
  },
  category:{
    type: String
  },
  // category: [{
  //   type: String
  // }],
  
  userid: {
    type: String
  },
  createdBy: {
    type: String
  },
  createdOn: {
    type: String
  },
  modifiedBy: {
    type: String
  },
  modifiedOn: {
    type: String
  },
  sendnotification: {
    type: String
  },
  companyId:{
    type: String
  },
  userGroups: [UserGroupSchema],
  group:{
    type: String
  },
  isDeleted: {
    type: Boolean
  },
  miscellaneous: {
    type: Boolean
  },
  archive: {
    type: Boolean
  },
  projectUsers: [ProjectUserSchema],
  notifyUsers: [NotifyUserSchema],
 
  // period:{
  //   type:String
  // },

  messages: [MessageSchema],
  uploadFiles: [UploadFileSchema],
  tasks:[TaskSchema]
  

}, { versionKey: false });

// // Use the unique validator plugin
// ProjectSchema.plugin(unique, { message: 'That {PATH} is already taken.' });

const Project = module.exports = mongoose.model('project', ProjectSchema);
