import mongoose from 'mongoose';

const UploadGlobalRepositoryFileSchema = new mongoose.Schema({
  title: String,
  fileName: String,
  description: String,
  path: String,
  createdOn: {
    type: Date,
    default: Date.now,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdBy: String,
}, { versionKey: false });

const UploadRepositoryFile = mongoose.model('UploadRepositoryFile', UploadGlobalRepositoryFileSchema);

export default UploadRepositoryFile;
