import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true,
  },
  groupMembers: {
    type: [String], // Assuming groupMembers are strings (user IDs, perhaps)
    default: [], // Default value as an empty array
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  versionKey: false,
});

const Group = mongoose.model('group', GroupSchema);

export default Group;
