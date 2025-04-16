//backend/models/Course.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const lectureSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: { // Add this field
    type: String,
    trim: true,
  },
  videoUrl: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  duration: {
    type: String,
    trim: true,
  },
});

const liveSessionSchema = new Schema({
  meetLink: {
    type: String,
    trim: true,
  },
  date: Date,
  topic: {
    type: String,
    trim: true,
  },
});

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    thumbnail: {
      type: String,
      trim: true,
    },
    isMonetized: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      min: 0,
      default: 0,
    },
    lectures: [lectureSchema],
    liveSession: liveSessionSchema,
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;