import { useState } from 'react'

function NoteCard({ note, onDelete, onSummarize }) {
  const noteId = note._id || note.id
  const [summarizing, setSummarizing] = useState(false)

  async function handleDelete() {
    try {
      await onDelete(noteId)
    } catch (err) {
      window.alert(err.message || 'Could not delete note.')
    }
  }

  async function handleSummarize() {
    setSummarizing(true)
    try {
      await onSummarize(noteId)
    } catch (err) {
      window.alert(err.message || 'Could not summarize note.')
    } finally {
      setSummarizing(false)
    }
  }

  return (
    <article className="note-card">
      <header className="note-card__header">
        <div>
          <p className="note-card__subject">{note.subject}</p>
          <h3 className="note-card__title">{note.title}</h3>
        </div>
        <button
          className="btn btn-danger"
          type="button"
          onClick={handleDelete}
          aria-label={`Delete note ${note.title}`}
        >
          Delete
        </button>
      </header>

      <p className="note-card__content">{note.content}</p>

      <div className="note-card__actions">
        <button
          className="btn btn-secondary"
          type="button"
          onClick={handleSummarize}
          disabled={summarizing}
        >
          {summarizing ? 'Summarizing...' : '✨ Summarize'}
        </button>
      </div>

      {note.summary ? (
        <div className="note-card__ai">
          <h4>AI Summary</h4>
          <pre className="note-card__summary">{note.summary}</pre>
          {note.quizQuestion ? (
            <>
              <h4>Quiz Question</h4>
              <p className="note-card__quiz">{note.quizQuestion}</p>
            </>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

export default NoteCard
