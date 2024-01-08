import mongoose from 'mongoose';

const SubTaskSchema = new mongoose.Schema({
  taskId: {
    type: String
  },
  title: {
    type: String
  },
  completed: {
    type: Boolean
  },
  edit: {
    type: Boolean
  },
  dateOfCompletion: {
    type: Date
  },
  isDeleted: {
    type: Boolean
  },
  hiddenUsrId: {
    type: String
  },
  storyPoint: {
    type: Number
  },
  subtaskHiddenDepId: {
    type: String
  },
  sequence: {
    type: Number
  }
  // priority: {
  //   type: String
  // },
  // status: {
  //   type: String
  // },
}, { versionKey: false });

//   // Use the unique validator plugin
//   SubTaskSchema.plugin(unique, { message: 'That {PATH} is already taken.' });

module.exports = { SubTask: mongoose.model('subTask', SubTaskSchema), SubTaskSchema: SubTaskSchema };