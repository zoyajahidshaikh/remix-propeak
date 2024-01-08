import mongoose from 'mongoose';

const ReplyMessageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  datePosted: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: Number,
    default: 0,
  },
  attachments: [
    {
      url: String,
      type: String,
    },
  ],
}, { _id: false });

const DiscussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  projectId: {
    type: String,
    required: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: String,
    required: true, // Or a specific type for UTC date
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  replyMessages: [ReplyMessageSchema],
}, { versionKey: false });

const DiscussionModel = mongoose.model('discussion', DiscussionSchema);

export { DiscussionModel, DiscussionSchema };
