import mongoose from 'mongoose';

const AccessRightSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true // Example: making userId mandatory
  },
  projectId: {
    type: String,
    required: true
  },
  entitlementId: {
    type: String,
    required: true,
    unique: true // Example: ensuring entitlementId is unique
  },
  group: {
    type: String
  },
  createdBy: {
    type: String,
    required: true
  },
  createdOn: {
    type: Date,
    default: Date.now // Example: setting default value for createdOn
  },
  isDeleted: {
    type: Boolean,
    default: false // Example: setting default value for isDeleted
  }
}, { versionKey: false });

const AccessRight = mongoose.model('AccessRight', AccessRightSchema);

export default AccessRight;


// import mongoose from 'mongoose';

// // Define the database model
// const AccessRightSchema = new mongoose.Schema({
//   userId:{
//     type: String
//   },
//   projectId: {
//     type: String
//   },
//   entitlementId: {
//     type: String
//   },
//   group: {
//     type: String
//   },
//   createdBy:{
//     type: String
//   },
//   createdOn:{
//     type: Date
//   },
//   isDeleted: {
//     type: Boolean
//   }
// }, { versionKey: false });

// // Use the unique validator plugin
// // UserSchema.plugin(unique, { message: 'That {PATH} is already taken.' });

// const AccessRight = module.exports = mongoose.model('accessright', AccessRightSchema);
