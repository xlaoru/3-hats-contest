'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { PublicArtwork } from '@/lib/actions/artwork.action'
import { submitJudgeShortlist, toggleJudgeShortlistArtwork } from '@/lib/actions/judge.action'
import { JUDGE_SHORTLIST_CAP } from '@/lib/judge-constants'
import { cn } from '@/lib/utils'
import { Check, CircleCheck, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type Tab = 'submissions' | 'shortlist'

type JudgeGalleryProps = {
  artworks: PublicArtwork[]
  slug: string
  initialShortlist: string[]
  initialSubmitted: boolean
}

export default function JudgeGallery({
  artworks,
  slug,
  initialShortlist,
  initialSubmitted,
}: JudgeGalleryProps) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('submissions')
  const [selected, setSelected] = useState<Set<string>>(new Set(initialShortlist))
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitted, setSubmitted] = useState(initialSubmitted)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isSubmitting, startSubmitTransition] = useTransition()
  const [, startToggleTransition] = useTransition()

  const toggle = (id: string) => {
    if (submitted || pendingId) return

    const isSelected = selected.has(id)

    if (!isSelected && selected.size >= JUDGE_SHORTLIST_CAP) return

    setError(null)
    setPendingId(id)

    setSelected((prev) => {
      const next = new Set(prev)
      if (isSelected) next.delete(id)
      else next.add(id)
      return next
    })

    startToggleTransition(async () => {
      const result = await toggleJudgeShortlistArtwork({ slug, artworkId: id })

      if (result.success && result.data) {
        setSelected(new Set(result.data.shortlist))
        router.refresh()
      } else {
        // Roll back the optimistic change since the server rejected it.
        setSelected((prev) => {
          const next = new Set(prev)
          if (isSelected) next.add(id)
          else next.delete(id)
          return next
        })
        setError(result.error?.message ?? "Couldn't update your vote, please try again")
      }
      setPendingId(null)
    })
  }

  const shortlisted = artworks.filter((artwork) => selected.has(artwork._id))

  const handleSubmit = () => {
    setError(null)
    startSubmitTransition(async () => {
      const result = await submitJudgeShortlist({ slug })

      setConfirmOpen(false)

      if (result.success) {
        setSubmitted(true)
        router.refresh()
      } else {
        setError(result.error?.message ?? "Couldn't submit your shortlist, please try again")
      }
    })
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center shadow-md">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-100">
          <CircleCheck className="size-6 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Shortlist submitted</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          Your {shortlisted.length} selected work{shortlisted.length === 1 ? '' : 's'}{' '}
          {shortlisted.length === 1 ? 'has' : 'have'} been sent to the admin. You can&apos;t make
          further changes.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-6 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab('submissions')}
          className={cn(
            'cursor-pointer border-b-2 border-transparent py-3 text-sm font-medium text-gray-500 hover:text-gray-700',
            tab === 'submissions' && 'border-blue-500 text-gray-900',
          )}
        >
          Submissions
        </button>
        <button
          type="button"
          onClick={() => setTab('shortlist')}
          className={cn(
            'cursor-pointer border-b-2 border-transparent py-3 text-sm font-medium text-gray-500 hover:text-gray-700',
            tab === 'shortlist' && 'border-blue-500 text-gray-900',
          )}
        >
          Shortlist ({selected.size})
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
      )}

      {tab === 'submissions' && (
        <>
          <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
            <p className="text-sm text-gray-600">Vote for the works you&apos;d like to shortlist.</p>
            <p className="text-sm font-semibold text-gray-900">
              {selected.size} / {JUDGE_SHORTLIST_CAP} selected
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artworks.map((artwork) => {
              const isSelected = selected.has(artwork._id)
              const atCap = !isSelected && selected.size >= JUDGE_SHORTLIST_CAP

              return (
                <div key={artwork._id} className="overflow-hidden rounded-2xl bg-white shadow-md">
                  <div className="h-56 overflow-hidden bg-gray-100">
                    <img
                      src={artwork.artworkImage}
                      alt={artwork.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-3 p-4">
                    <button
                      type="button"
                      onClick={() => toggle(artwork._id)}
                      disabled={atCap || pendingId === artwork._id}
                      className={cn(
                        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors',
                        isSelected
                          ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                          : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
                        (atCap || pendingId === artwork._id) &&
                          'cursor-not-allowed bg-gray-200 text-gray-400 hover:bg-gray-200',
                      )}
                    >
                      {isSelected ? (
                        <>
                          <Check className="size-4" /> Voted
                        </>
                      ) : (
                        'Vote for this work'
                      )}
                    </button>
                    <div>
                      <h2 className="truncate text-base font-semibold text-gray-900">
                        {artwork.title}
                      </h2>
                      <p className="truncate text-sm text-gray-500">
                        {artwork.participant.name} · {artwork.participant.state}
                      </p>
                      <p className="mt-1 truncate text-xs text-gray-400">{artwork.medium}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {tab === 'shortlist' && (
        <>
          {shortlisted.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center text-gray-400 shadow-md">
              You haven&apos;t voted for any works yet. Switch to Submissions to start.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shortlisted.map((artwork) => (
                <div key={artwork._id} className="overflow-hidden rounded-2xl bg-white shadow-md">
                  <div className="h-56 overflow-hidden bg-gray-100">
                    <img
                      src={artwork.artworkImage}
                      alt={artwork.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-3 p-4">
                    <button
                      type="button"
                      onClick={() => toggle(artwork._id)}
                      disabled={pendingId === artwork._id}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X className="size-4" /> Remove from shortlist
                    </button>
                    <div>
                      <h2 className="truncate text-base font-semibold text-gray-900">
                        {artwork.title}
                      </h2>
                      <p className="truncate text-sm text-gray-500">
                        {artwork.participant.name} · {artwork.participant.state}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              disabled={selected.size === 0 || isSubmitting}
              onClick={() => setConfirmOpen(true)}
              className="inline-flex w-fit cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
            >
              Submit shortlist
            </button>
            {selected.size === 0 && (
              <p className="text-xs text-gray-400">Vote for at least one work before submitting.</p>
            )}
          </div>
        </>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Submit your shortlist?</DialogTitle>
            <DialogDescription>
              You&apos;ve selected {selected.size} work{selected.size === 1 ? '' : 's'}. Once
              submitted, you won&apos;t be able to change your selections.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              disabled={isSubmitting}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit shortlist'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
