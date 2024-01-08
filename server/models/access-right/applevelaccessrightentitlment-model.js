import mongoose from 'mongoose';

const AppLevelAccessRightEntitlementSchema = new mongoose.Schema({
  entitlementId: {
    type: String,
    required: true,
    unique: true,
  },
  group: {
    type: String,
  },
  value: {
    type: Boolean,
    default: false,
  },
}, { versionKey: false });

const AppLevelAccessRightEntitlement = mongoose.model('AppLevelAccessRightEntitlement', AppLevelAccessRightEntitlementSchema);

export default AppLevelAccessRightEntitlement;
