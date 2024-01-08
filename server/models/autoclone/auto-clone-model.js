import mongoose from 'mongoose';

const AutoCloneSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
  },
  periodType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
  },
  repeat: {
    type: Number,
  },
  endOnDate: {
    type: Date,
  },
  endAfterOccurrences: {
    type: Number,
  },
  endNever: {
    type: Boolean,
  },
  monthlyType: {
    type: String,
    enum: ['day', 'date'],
  },
  day: {
    type: Number,
  },
  repeatOnDateValue: {
    type: Number,
  },
  monthRepeatOnDayValue: {
    type: String,
  },
  monthRepeatOnDayValueOccurrences: {
    type: Number,
  },
  startDate: {
    type: Date,
    required: true,
  },
}, { versionKey: false });

const AutoClone = mongoose.model('AutoClone', AutoCloneSchema);

export default AutoClone;
