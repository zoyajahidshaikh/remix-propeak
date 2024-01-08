import mongoose from 'mongoose';

const HolidaySchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  monthName: {
    type: String,
    required: true,
  },
  date: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  frequency: {
    type: String,
  },
  all: {
    type: String,
  },
  day: {
    type: String,
  },
  dayName: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { versionKey: false });

const Holiday = mongoose.model("holidays", HolidaySchema);

export default Holiday;
