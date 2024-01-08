import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  sequence: Number,
  title: String,
  displayName: String,
  show: {
    type: Boolean,
    default: true, // Assuming default is to show the category
  },
}, { versionKey: false });

const CategoryModel = mongoose.model('Category', CategorySchema);

export default CategoryModel;
