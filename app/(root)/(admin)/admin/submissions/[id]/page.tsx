import { getArtworkById } from '@/lib/actions/artwork.action'
import { statusLabels, statusStyles } from '@/lib/artwork-status'
import { CircleCheckBig } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ArtworkActions from './artwork-actions'
import ArtworkNotes from './artwork-notes'
import ArtworkPreview from './artwork-preview'
import EditArtworkModal from './edit-artwork-modal'

const submittedAtFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const REJECTION_NOTE_PREFIX = 'Rejected — reason: '

function parseRejectionNote(text: string): { reason: string; message?: string } | null {
  if (!text.startsWith(REJECTION_NOTE_PREFIX)) return null

  const withoutPrefix = text.slice(REJECTION_NOTE_PREFIX.length)
  const newlineIndex = withoutPrefix.indexOf('\n')

  if (newlineIndex === -1) {
    return { reason: withoutPrefix }
  }

  return {
    reason: withoutPrefix.slice(0, newlineIndex),
    message: withoutPrefix.slice(newlineIndex + 1).trim() || undefined,
  }
}

const ArtworkPage = async (props: PageProps<'/admin/submissions/[id]'>) => {
  const { id } = await props.params
  const { success, data: artwork } = await getArtworkById(id)

  if (!success || !artwork) {
    return notFound()
  }

  const rejection =
    artwork.status === 'rejected'
      ? [...artwork.notes].reverse().map((note) => parseRejectionNote(note.text)).find(Boolean)
      : null

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-6 sm:px-6 sm:py-10 flex flex-col gap-6">
      <Link
        href="/admin/submissions"
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center gap-1"
      >
        ← Back to submissions
      </Link>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/2 min-w-0">
          <div className="flex flex-col gap-4 pb-4 border-b border-zinc-300">
            <h1 className="text-2xl font-bold text-zinc-900 break-words">
              Submissions {artwork._id}
            </h1>
            <div className="flex flex-row flex-wrap items-center gap-4">
              <span
                className={`text-sm px-3 py-1 rounded-md flex gap-2 items-center font-medium ${statusStyles[artwork.status]}`}
              >
                {statusLabels[artwork.status]}
              </span>
              <p className="text-sm text-zinc-500">
                Submitted {submittedAtFormatter.format(new Date(artwork.createdAt!))}
              </p>
            </div>
            <ArtworkActions artworkId={artwork._id} status={artwork.status} />
          </div>
          {rejection && (
            <div className="flex flex-col gap-2 mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-600">Reject reason</p>
              <p className="text-base font-bold text-zinc-900 break-words">{rejection.reason}</p>
              {rejection.message && (
                <p className="text-sm text-zinc-700 whitespace-pre-wrap break-words">
                  {rejection.message}
                </p>
              )}
            </div>
          )}
          <div className="flex flex-col gap-4 py-4 border-b border-zinc-300">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-md font-bold text-zinc-900">Applicant & Artwork Details</h3>
              {artwork.status === "approved" || <EditArtworkModal
                artworkId={artwork._id}
                name={artwork.participant.name}
                email={artwork.participant.email}
                state={artwork.participant.state}
                title={artwork.title}
                medium={artwork.medium}
                artworkSize={artwork.artworkSize}
                venue={artwork.venue}
                dateCreated={artwork.dateCreated}
                artworkImage={artwork.artworkImage}
                proveImage={artwork.proveImage}
              />}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-sm text-gray-500">Artist name</p>
                <p className="text-lg text-zinc-900 break-words">{artwork.participant.name}</p>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-sm text-gray-500">Artwork title</p>
                <p className="text-lg text-zinc-900 break-words">{artwork.title}</p>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg text-zinc-900 break-words">{artwork.participant.email}</p>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-sm text-gray-500">Medium</p>
                <p className="text-lg text-zinc-900 break-words">{artwork.medium}</p>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-sm text-gray-500">State</p>
                <p className="text-lg text-zinc-900 break-words">{artwork.participant.state}</p>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-sm text-gray-500">Dimensions</p>
                <p className="text-lg text-zinc-900 break-words">{artwork.artworkSize}</p>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-sm text-gray-500">Date of work</p>
                <p className="text-lg text-zinc-900 break-words">
                  {submittedAtFormatter.format(new Date(artwork.dateCreated))}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 pt-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-500 inline-flex items-center">Reference number</p>
              <p className="text-lg text-zinc-900 inline-flex items-center break-words">
                {artwork._id}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-500 inline-flex items-center">Agreement</p>
              <p className="text-lg text-zinc-900 flex items-center gap-2">
                <CircleCheckBig size={12} className="text-green-700 shrink-0" />
                {artwork.agreedToRules
                  ? 'Artist has agreed to the rules and terms'
                  : "Artist hasn't agreed to the rules and terms"}
              </p>
            </div>
            <ArtworkNotes artworkId={artwork._id} notes={artwork.notes ?? []} />
          </div>
        </div>
        <div className="w-full lg:w-1/2 min-w-0">
          <ArtworkPreview
            title={artwork.title}
            artworkImage={artwork.artworkImage}
            proveImage={artwork.proveImage}
          />
        </div>
      </div>
    </div>
  )
}

export default ArtworkPage
