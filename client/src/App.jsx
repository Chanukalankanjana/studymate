import { useEffect, useState } from 'react'
import NoteForm from './components/NoteForm'
import NoteCard from './components/NoteCard'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/notes'

function getInitialTheme() {
  const saved = localStorage.getItem('studymate-theme')
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function App() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('studymate-theme', theme)
  }, [theme])

  useEffect(() => {
    async function loadNotes() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(API_URL)

        if (!response.ok) {
          throw new Error('Failed to load notes.')
        }

        const data = await response.json()
        setNotes(Array.isArray(data) ? data : data.notes || [])
      } catch (err) {
        setError(
          err.message ||
            'Could not reach the API. Make sure the server is running.',
        )
        setNotes([])
      } finally {
        setLoading(false)
      }
    }

    loadNotes()
  }, [])

  async function handleAddNote(newNote) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNote),
    })

    if (!response.ok) {
      throw new Error('Failed to add note.')
    }

    const created = await response.json()
    setNotes((current) => [created, ...current])
  }

  async function handleUpdateNote(id, updates) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update note.')
    }

    setNotes((current) =>
      current.map((note) => ((note._id || note.id) === id ? data : note)),
    )
  }

  async function handleDeleteNote(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete note.')
    }

    setNotes((current) =>
      current.filter((note) => (note._id || note.id) !== id),
    )
  }

  async function handleSummarizeNote(id) {
    const response = await fetch(`${API_URL}/${id}/summarize`, {
      method: 'POST',
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || 'Failed to summarize note.')
    }

    setNotes((current) =>
      current.map((note) => ((note._id || note.id) === id ? data : note)),
    )
  }

  const query = search.trim().toLowerCase()
  const filteredNotes = notes.filter((note) => {
    if (!query) return true
    const title = (note.title || '').toLowerCase()
    const subject = (note.subject || '').toLowerCase()
    return title.includes(query) || subject.includes(query)
  })

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">Your study workspace</p>
          <h1>StudyMate</h1>
        </div>
        <button
          className="btn theme-toggle"
          type="button"
          onClick={() =>
            setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
          }
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </header>

      <main className="app-layout">
        <aside className="sidebar">
          <NoteForm onAdd={handleAddNote} />
        </aside>

        <section className="notes-panel" aria-labelledby="notes-heading">
          <div className="notes-toolbar">
            <h2 id="notes-heading">Your notes</h2>
            <label className="search-field" htmlFor="note-search">
              <span className="visually-hidden">Search notes</span>
              <input
                id="note-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title or subject..."
              />
            </label>
          </div>

          {loading ? <p className="status">Loading notes...</p> : null}

          {!loading && error ? <p className="status status-error">{error}</p> : null}

          {!loading && !error && notes.length === 0 ? (
            <p className="status empty">No notes yet — add your first one!</p>
          ) : null}

          {!loading && !error && notes.length > 0 && filteredNotes.length === 0 ? (
            <p className="status empty">No notes match your search.</p>
          ) : null}

          {!loading && !error && filteredNotes.length > 0 ? (
            <div className="notes-grid">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note._id || note.id}
                  note={note}
                  onDelete={handleDeleteNote}
                  onSummarize={handleSummarizeNote}
                  onUpdate={handleUpdateNote}
                />
              ))}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  )
}

export default App
