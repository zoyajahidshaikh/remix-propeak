import mongoose from 'mongoose';

const DefaultAppLevelAccessRightSchema = new mongoose.Schema({
  userRole: {
    type: String,
    required: true,
  },
  entitlement: {
    type: String,
    required: true,
  },
  group: String, // Shorthand notation for defining a String type without extra configuration
}, { versionKey: false });

const DefaultAppLevelAccessRight = mongoose.model('DefaultAppLevelAccessRight', DefaultAppLevelAccessRightSchema);

export default DefaultAppLevelAccessRight;
