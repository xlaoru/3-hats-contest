'use client'

import { addArtworkNote } from '@/lib/actions/artwork.action'
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

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-md font-bold text-zinc-900 flex items-center gap-2">
      </h3>
      {notes.length > 0 && (
        <div className="flex flex-col gap-2">
          {[...notes].reverse().map((note, index) => (
            <div key={index} className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
              <p className="text-sm text-zinc-800">{note.text}</p>
              <p className="text-xs text-zinc-500 mt-2">
                Added on {formatNoteDate(note.createdAt)} by {note.author}
              </p>
            </div>
          ))}
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
