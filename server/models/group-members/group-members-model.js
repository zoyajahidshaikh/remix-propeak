import mongoose from 'mongoose';

const GroupMembersSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
}, { versionKey: false });

const GroupMember = mongoose.model('groupmember', GroupMembersSchema);

export { GroupMember, GroupMembersSchema };
