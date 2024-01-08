import mongoose from 'mongoose';
const {SubTask,SubTaskSchema} = require('../sub-task/subtask-model');
const {Message,MessageSchema} = require('../message/message-model');
const {UploadFile,UploadFileSchema} = require('../upload-file/upload-file-model');

// Define the database model
const TaskSchema = new mongoose.Schema({
  userId:  {
    type: String
  },
  title: {
    type: String
  },
  description: {
    type: String
  },
  completed: {
    type: Boolean
  },
  category: {
    type: String
  },
  tag: {
    type: String
  },
  status: {
    type: String
  },
  storyPoint: {
    type: Number
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  depId: {
    type: String
  },
  taskType: {
    type: String
  },
  priority: {
    type: String
  },
  createdOn: {
    type: String //UTC date
  },
  modifiedOn: {
    type: String
  },
  createdBy: {
    type: String //UTC date
  },
  modifiedBy: {
    type: String
  },
  isDeleted: {
    type: Boolean
  },
  sequence: {
    type: String
  },
  messages: [MessageSchema],
  uploadFiles: [UploadFileSchema],
  subtasks:[SubTaskSchema],
  dateOfCompletion: {
    type: String
  },
  subtaskId: {
    type: String
  }
},{ versionKey: false });


// Use the unique validator plugin
// TaskSchema.plugin(unique, { message: 'That {PATH} is already taken.' });

module.exports = {Tasks:mongoose.model('task', TaskSchema),TaskSchema:TaskSchema};