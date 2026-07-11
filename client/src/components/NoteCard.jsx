import { useEffect, useState } from 'react'

function NoteCard({ note, onDelete, onSummarize, onUpdate }) {
  const noteId = note._id || note.id
  const [summarizing, setSummarizing] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(note.title || '')
  const [subject, setSubject] = useState(note.subject || '')
  const [content, setContent] = useState(note.content || '')
  const [selectedAnswers, setSelectedAnswers] = useState({})

  useEffect(() => {
    if (!editing) {
      setTitle(note.title || '')
      setSubject(note.subject || '')
      setContent(note.content || '')
    }
  }, [note, editing])

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

  async function handleSave(event) {
    event.preventDefault()
    setSaving(true)
    try {
      await onUpdate(noteId, {
        title: title.trim(),
        subject: subject.trim(),
        content: content.trim(),
      })
      setEditing(false)
    } catch (err) {
      window.alert(err.message || 'Could not update note.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancelEdit() {
    setTitle(note.title || '')
    setSubject(note.subject || '')
    setContent(note.content || '')
    setEditing(false)
  }

  const quizItems =
    Array.isArray(note.quizQuestions) && note.quizQuestions.length > 0
      ? note.quizQuestions
      : note.quizQuestion
        ? [{ question: note.quizQuestion, options: [], correctAnswer: '' }]
        : []

  return (
    <article className="note-card">
      {editing ? (
        <form className="note-edit-form" onSubmit={handleSave}>
          <label htmlFor={`edit-title-${noteId}`}>Title</label>
          <input
            id={`edit-title-${noteId}`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />

          <label htmlFor={`edit-subject-${noteId}`}>Subject</label>
          <input
            id={`edit-subject-${noteId}`}
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />

          <label htmlFor={`edit-content-${noteId}`}>Content</label>
          <textarea
            id={`edit-content-${noteId}`}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={5}
            required
          />

          <div className="note-card__actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={handleCancelEdit}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <header className="note-card__header">
            <div>
              <p className="note-card__subject">{note.subject}</p>
              <h3 className="note-card__title">{note.title}</h3>
            </div>
            <div className="note-card__header-actions">
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger"
                type="button"
                onClick={handleDelete}
                aria-label={`Delete note ${note.title}`}
              >
                Delete
              </button>
            </div>
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
        </>
      )}

      {!editing && note.summary ? (
        <div className="note-card__ai">
          <h4>AI Summary</h4>
          <pre className="note-card__summary">{note.summary}</pre>

          {quizItems.length > 0 ? (
            <>
              <h4>Quiz Mode (3 MCQs)</h4>
              <ol className="quiz-list">
                {quizItems.map((item, index) => {
                  const key = `${noteId}-q-${index}`
                  const selected = selectedAnswers[key]
                  const isCorrect =
                    selected &&
                    item.correctAnswer &&
                    selected === item.correctAnswer

                  return (
                    <li key={key} className="quiz-item">
                      <p className="quiz-question">{item.question}</p>
                      {Array.isArray(item.options) && item.options.length > 0 ? (
                        <div className="quiz-options">
                          {item.options.map((option) => (
                            <button
                              key={option}
                              type="button"
                              className={`quiz-option ${
                                selected === option ? 'is-selected' : ''
                              } ${
                                selected === option && isCorrect
                                  ? 'is-correct'
                                  : ''
                              } ${
                                selected === option &&
                                item.correctAnswer &&
                                !isCorrect
                                  ? 'is-wrong'
                                  : ''
                              }`}
                              onClick={() =>
                                setSelectedAnswers((current) => ({
                                  ...current,
                                  [key]: option,
                                }))
                              }
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="note-card__quiz">{item.question}</p>
                      )}
                      {selected && item.correctAnswer ? (
                        <p className="quiz-feedback">
                          {isCorrect
                            ? 'Correct!'
                            : `Answer: ${item.correctAnswer}`}
                        </p>
                      ) : null}
                    </li>
                  )
                })}
              </ol>
            </>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

export default NoteCard
