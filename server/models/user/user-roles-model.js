import mongoose from 'mongoose';

// Define the database model
const UserRoleSchema = new mongoose.Schema({
  role: {
    type: String
  },
  displayName: {
    type: String
  }
}, {
  versionKey: false
});

// Use the unique validator plugin
// UserSchema.plugin(unique, { message: 'That {PATH} is already taken.' });

const UserRoles = module.exports = mongoose.model('userRoles', UserRoleSchema);