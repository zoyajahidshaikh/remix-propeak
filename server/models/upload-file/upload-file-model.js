import mongoose from 'mongoose';


// Define the database model
const UploadFileSchema = new mongoose.Schema({
  isDeleted: {
    type: Boolean
  },
  filename : {
    type: String
  },
  createdOn:{
      type:Date
  },
  createdBy: {
    type: String
  }
}, { versionKey: false });

 module.exports = {UploadFile :mongoose.model('uploadFile', UploadFileSchema),UploadFileSchema:UploadFileSchema};