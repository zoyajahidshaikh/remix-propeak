import mongoose from 'mongoose';

const BurndownSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  todoCount: {
    type: Number,
    default: 0,
  },
  inProgressCount: {
    type: Number,
    default: 0,
  },
  completedCount: {
    type: Number,
    default: 0,
  },
  todoStoryPoints: {
    type: Number,
    default: 0,
  },
  inProgressStoryPoints: {
    type: Number,
    default: 0,
  },
  completedStoryPoints: {
    type: Number,
    default: 0,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, { collection: 'burndown', versionKey: false });

const BurndownModel = mongoose.model('Burndown', BurndownSchema);

export default BurndownModel;
