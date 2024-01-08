import mongoose from 'mongoose';

const AuditLogsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  projectId: {
    type: String,
    required: true,
  },
  tableName: {
    type: String,
    required: true,
  },
  fieldName: {
    type: String,
    required: true,
  },
  oldValue: String, // Shorthand notation for optional String type
  newValue: String, // Shorthand notation for optional String type
  updatedBy: {
    type: String,
    required: true,
  },
  updatedOn: {
    type: Date,
    default: Date.now,
  },
}, { versionKey: false });

const AuditLog = mongoose.model('AuditLogs', AuditLogsSchema);

export default AuditLog;
