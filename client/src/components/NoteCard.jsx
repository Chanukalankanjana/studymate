function NoteCard({ note, onDelete }) {
  const noteId = note._id || note.id

  async function handleDelete() {
    try {
      await onDelete(noteId)
    } catch (err) {
      window.alert(err.message || 'Could not delete note.')
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
    </article>
  )
}

export default NoteCard
