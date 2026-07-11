import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Note from './models/Note.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  console.error('Missing MONGO_URI. Copy .env.example to .env and set your MongoDB URI.')
  process.exit(1)
}

app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
)
app.use(express.json())

app.get('/api/notes', async (_req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 })
    res.json(notes)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes.' })
  }
})

app.post('/api/notes', async (req, res) => {
  try {
    const { title, subject, content } = req.body

    if (!title || !String(title).trim() || !content || !String(content).trim()) {
      return res.status(400).json({
        error: 'Title and content are required.',
      })
    }

    const note = await Note.create({
      title: String(title).trim(),
      subject: subject ? String(subject).trim() : '',
      content: String(content).trim(),
    })

    res.status(201).json(note)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note.' })
  }
})

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid note id.' })
    }

    const deleted = await Note.findByIdAndDelete(id)

    if (!deleted) {
      return res.status(404).json({ error: 'Note not found.' })
    }

    res.json({ message: 'Note deleted.', note: deleted })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note.' })
  }
})

async function start() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('Connected to MongoDB')

    app.listen(PORT, () => {
      console.log(`StudyMate API running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  }
}

start()
