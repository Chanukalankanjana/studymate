import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    trim: true,
    default: '',
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  summary: {
    type: String,
    default: '',
  },
  quizQuestion: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Note = mongoose.model('Note', noteSchema)

export default Note
