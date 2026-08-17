'use client'

import { addArtworkNote, deleteArtworkNote, updateArtworkNote } from '@/lib/actions/artwork.action'
import { useState, useTransition } from 'react'

type ArtworkNote = {
  text: string
  author: string
  createdAt: string | Date
}

type ArtworkNotesProps = {
  artworkId: string
  notes: ArtworkNote[]
}

const noteDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function formatNoteDate(value: string | Date): string {
  return noteDateFormatter.format(new Date(value))
}

export default function ArtworkNotes({ artworkId, notes: initialNotes }: ArtworkNotesProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [isEditPending, startEditTransition] = useTransition()

  const [menuIndex, setMenuIndex] = useState<number | null>(null)
  const [isDeletePending, startDeleteTransition] = useTransition()

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed) return

    startTransition(async () => {
      const result = await addArtworkNote({ artworkId, text: trimmed })

      if (result.success && result.data) {
        setError(null)
        setText('')
        setNotes(result.data.notes as ArtworkNote[])
      } else {
        setError(result.error?.message ?? "Couldn't save the note, please try again")
      }
    })
  }

  const startEditing = (noteIndex: number, currentText: string) => {
    setMenuIndex(null)
    setEditingIndex(noteIndex)
    setEditText(currentText)
    setEditError(null)
  }

  const cancelEditing = () => {
    setEditingIndex(null)
    setEditText('')
    setEditError(null)
  }

  const handleEditSubmit = (noteIndex: number) => {
    const trimmed = editText.trim()
    if (!trimmed) return

    startEditTransition(async () => {
      const result = await updateArtworkNote({ artworkId, noteIndex, text: trimmed })

      if (result.success && result.data) {
        setNotes(result.data.notes as ArtworkNote[])
        setEditingIndex(null)
        setEditText('')
        setEditError(null)
      } else {
        setEditError(result.error?.message ?? "Couldn't save the note, please try again")
      }
    })
  }

  const handleDelete = (noteIndex: number) => {
    setMenuIndex(null)

    startDeleteTransition(async () => {
      const result = await deleteArtworkNote({ artworkId, noteIndex })

      if (result.success && result.data) {
        setNotes(result.data.notes as ArtworkNote[])
        if (editingIndex === noteIndex) cancelEditing()
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-md font-bold text-zinc-900 flex items-center gap-2">
      </h3>
      {notes.length > 0 && (
        <div className="flex flex-col gap-2">
          {[...notes].reverse().map((note, index) => {
            const noteIndex = notes.length - 1 - index
            const isEditing = editingIndex === noteIndex
            const isMenuOpen = menuIndex === noteIndex

            return (
              <div
                key={noteIndex}
                className="relative rounded-lg bg-amber-50 border border-amber-100 px-4 py-3"
              >
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      disabled={isEditPending}
                      autoFocus
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400 disabled:opacity-50"
                    />
                    {editError && <p className="text-xs text-red-600">{editError}</p>}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditSubmit(noteIndex)}
                        disabled={isEditPending || !editText.trim()}
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 disabled:opacity-50"
                      >
                        {isEditPending ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        disabled={isEditPending}
                        className="rounded-lg border border-transparent px-3 py-1.5 text-xs text-zinc-500 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-zinc-800 whitespace-pre-wrap">{note.text}</p>
                      <button
                        type="button"
                        onClick={() => setMenuIndex(isMenuOpen ? null : noteIndex)}
                        disabled={isDeletePending}
                        aria-label="Note actions"
                        className="shrink-0 rounded-md px-1.5 py-0.5 text-lg leading-none text-zinc-500 hover:bg-amber-100 hover:text-zinc-800 cursor-pointer disabled:opacity-50"
                      >
                        &#8942;
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">
                      Added on {formatNoteDate(note.createdAt)} by {note.author}
                    </p>
                    {isMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuIndex(null)} />
                        <div className="absolute right-3 top-8 z-20 flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-md">
                          <button
                            type="button"
                            onClick={() => startEditing(noteIndex, note.text)}
                            className="px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(noteIndex)}
                            className="px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a note for the internal review team..."
          rows={3}
          disabled={isPending}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400 disabled:opacity-50"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !text.trim()}
          className="self-start rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 disabled:opacity-50"
        >
          {isPending ? 'Adding...' : 'Add note'}
        </button>
      </div>
    </div>
  )
}
