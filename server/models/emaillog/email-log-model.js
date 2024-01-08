import mongoose from 'mongoose';

const EmailLogsSchema = new mongoose.Schema({
  to: {
    type: String,
    required: true,
  },
  cc: String,
  subject: {
    type: String,
    required: true,
  },
  bodyText: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
}, { versionKey: false });

const EmailLog = mongoose.model('emaillog', EmailLogsSchema);

export default EmailLog;
