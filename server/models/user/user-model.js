const bcrypt = require('bcrypt-nodejs');
import mongoose from 'mongoose';

// Define the database model

const SALT_WORK_FACTOR = 10;
const UserSchema = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String,
    index: { unique: true }
  },
  password: {
    type: String
  },
  role: {
    type: String
  },
  isDeleted: {
    type: Boolean
  },
  companyId: {
    type: String
  },
  reportingManagerId: {
    type: String
  },
  contactNumber: {
    type: String
  },
  alternateNumber: {
    type: String
  },
  gender: {
    type: String
  },
  dob: {
    type: String
  },
  dateOfJoining: {
    type: String
  },
  designation: {
    type: String
  },
  bloodGroup: {
    type: String
  },
  currentAddress: {
    type: String
  },
  permanentAddress: {
    type: String
  },
  panNo: {
    type: String
  },
  addharNo: {
    type: String
  },
  passportNo: {
    type: String
  },
  passportName: {
    type: String
  },
  passportissueDate: {
    type: String
  },
  passportexpiryDate: {
    type: String
  },
  placeOfIssue: {
    type: String
  },

  profilePicture: {
    type: String
  },
  isActive: {
    type: Boolean
  },
  createdBy: {
    type: String
  },
  createdOn: {
    type: String
  },
  modifiedBy: {
    type: String
  },
  modifiedOn: {
    type: String
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isLocked: {
    type: Boolean
  },
  lockedDateTime: {
    type: Date
  }
},
  { versionKey: false });

UserSchema.pre('save', function (next) {
  try {
    var user = this;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
      return next();
    }
    // generate a salt
    // bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    //   if (err) return next(err);

    //   // hash the password using our new salt
    //   bcrypt.hash(user.password, salt, function (err, hash) {
    //     if (err) {
    //       return next(err);
    //     }

    //     // override the cleartext password with the hashed one
    //     user.password = hash;
    //     next();
    //   });
    // });
    bcrypt.hash(user.password, null, null, function (err, hash) {
      // Store hash in your password DB.
      if (err) {
        //console.log(err);
        return next(err);
      }
      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  }
  catch (e) {
    //console.log("use schema err",e);
    return next(e);
  }
});


UserSchema.methods.comparePassword = function (candidatePassword, cb) {
  //console.log("candidatePassword", candidatePassword);
  //console.log("this.password", this.password);
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
  // console.log("hash", hash);
  // bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
  //   // res == true
  //   if (err) {
  //     return cb(err);
  //   }
  //   cb(null, isMatch);
  // });
};

const User = module.exports = mongoose.model('user', UserSchema);