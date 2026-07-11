import { useState } from 'react'

function NoteForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const trimmedTitle = title.trim()
    const trimmedSubject = subject.trim()
    const trimmedContent = content.trim()

    if (!trimmedTitle || !trimmedSubject || !trimmedContent) {
      setError('Please fill in title, subject, and content.')
      return
    }

    setSubmitting(true)

    try {
      await onAdd({
        title: trimmedTitle,
        subject: trimmedSubject,
        content: trimmedContent,
      })
      setTitle('')
      setSubject('')
      setContent('')
    } catch (err) {
      setError(err.message || 'Could not add note.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <h2>Add a note</h2>

      <label htmlFor="note-title">Title</label>
      <input
        id="note-title"
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="e.g. Cell membranes"
        autoComplete="off"
      />

      <label htmlFor="note-subject">Subject</label>
      <input
        id="note-subject"
        type="text"
        value={subject}
        onChange={(event) => setSubject(event.target.value)}
        placeholder="e.g. Biology"
        autoComplete="off"
      />

      <label htmlFor="note-content">Content</label>
      <textarea
        id="note-content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write your study notes here..."
        rows={5}
      />

      {error ? <p className="form-error">{error}</p> : null}

      <button className="btn btn-primary" type="submit" disabled={submitting}>
        {submitting ? 'Adding...' : 'Add note'}
      </button>
    </form>
  )
}

export default NoteForm
