import mongoose from 'mongoose'

const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: { type: [String], default: [] },
    correctAnswer: { type: String, default: '' },
  },
  { _id: false },
)

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
  quizQuestions: {
    type: [quizQuestionSchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Note = mongoose.model('Note', noteSchema)

export default Note
