import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true, // Marking companyName as required
  },
  companyCode: {
    type: String,
  },
  country: {
    type: String,
    required: true, // Marking country as required
  },
  address: {
    type: String,
  },
  contact: {
    type: String,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, { collection: 'company', versionKey: false });

const CompanyModel = mongoose.model('Company', CompanySchema);

export default CompanyModel;
