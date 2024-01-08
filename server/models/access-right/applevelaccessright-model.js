import mongoose from 'mongoose';

const AppLevelAccessRightSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true // Example: making userId mandatory
  },
  entitlementId: {
    type: String,
    required: true,
    unique: true // Example: ensuring entitlementId is unique
  },
  group: {
    type: String
  },
  access: {
    type: Boolean
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

const AppLevelAccessRight = mongoose.model('AppLevelAccessRight', AppLevelAccessRightSchema);

export default AppLevelAccessRight;
