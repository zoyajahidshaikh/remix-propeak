import mongoose from 'mongoose';


// Define the database model
const MessageSchema = new mongoose.Schema({
  title : {
    type: String
  },
  isDeleted: {
    type: Boolean
  },
  createdOn:{
      type:Date
  },
  createdBy: {
    type: String
  }
}, { versionKey: false });
//module.exports =MessageSchema;
module.exports ={Message: mongoose.model('message', MessageSchema),MessageSchema:MessageSchema};