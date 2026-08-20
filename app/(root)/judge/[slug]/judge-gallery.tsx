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
import { Check, ChevronLeft, ChevronRight, CircleCheck, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type Tab = 'submissions' | 'shortlist'
type PreviewSource = 'submissions' | 'shortlist'

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
  const [previewSource, setPreviewSource] = useState<PreviewSource | null>(null)
  const [rawPreviewIndex, setRawPreviewIndex] = useState<number | null>(null)
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

  const renderVoteButton = (artwork: PublicArtwork) => {
    const isSelected = selected.has(artwork._id)
    const atCap = !isSelected && selected.size >= JUDGE_SHORTLIST_CAP

    return (
      <button
        type="button"
        onClick={() => toggle(artwork._id)}
        disabled={atCap || pendingId === artwork._id}
        className={cn(
          'group inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
          isSelected
            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
            : 'bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950',
          (atCap || pendingId === artwork._id) &&
          'cursor-not-allowed bg-zinc-100 text-zinc-400 hover:border-transparent hover:bg-zinc-100 hover:text-zinc-400',
        )}
      >
        {isSelected ? (
          <>
            <Check className="size-4 group-hover:hidden" />
            <X className="hidden size-4 group-hover:inline" />
            <span className="group-hover:hidden">Voted</span>
            <span className="hidden group-hover:inline">Unvote</span>
          </>
        ) : (
          'Vote'
        )}
      </button>
    )
  }

  const shortlisted = artworks.filter((artwork) => selected.has(artwork._id))

  const previewList = previewSource === 'shortlist' ? shortlisted : artworks
  // Clamp instead of storing raw index: if the active list shrinks (e.g. unvoting removes the
  // current item), this keeps the slider in range without an effect-driven setState.
  const previewIndex =
    rawPreviewIndex !== null && previewList.length > 0
      ? Math.min(rawPreviewIndex, previewList.length - 1)
      : null
  const previewArtwork = previewIndex !== null ? previewList[previewIndex] : null

  const openPreview = (source: PreviewSource, list: PublicArtwork[], artwork: PublicArtwork) => {
    const index = list.findIndex((item) => item._id === artwork._id)
    if (index === -1) return
    setPreviewSource(source)
    setRawPreviewIndex(index)
  }

  const closePreview = () => {
    setPreviewSource(null)
    setRawPreviewIndex(null)
  }

  const showPrevPreview = () => {
    if (previewIndex !== null && previewIndex > 0) setRawPreviewIndex(previewIndex - 1)
  }

  const showNextPreview = () => {
    if (previewIndex !== null && previewIndex < previewList.length - 1) {
      setRawPreviewIndex(previewIndex + 1)
    }
  }

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
      <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-100">
          <CircleCheck className="size-6 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Shortlist submitted</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
          Your {shortlisted.length} selected work{shortlisted.length === 1 ? '' : 's'}{' '}
          {shortlisted.length === 1 ? 'has' : 'have'} been sent to the admin. You can&apos;t make
          further changes.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-6 border-b border-zinc-200">
        <button
          type="button"
          onClick={() => setTab('submissions')}
          className={cn(
            'cursor-pointer border-b-2 border-transparent py-3 text-sm font-medium text-zinc-500 hover:text-zinc-700',
            tab === 'submissions' && 'border-zinc-900 text-zinc-900',
          )}
        >
          Submissions ({artworks.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('shortlist')}
          className={cn(
            'cursor-pointer border-b-2 border-transparent py-3 text-sm font-medium text-zinc-500 hover:text-zinc-700',
            tab === 'shortlist' && 'border-zinc-900 text-zinc-900',
          )}
        >
          Shortlist ({selected.size})
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {tab === 'submissions' && (
        <>
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-sm text-zinc-600">Vote for the works you&apos;d like to shortlist.</p>
            <p className="text-sm font-semibold text-zinc-900">
              {selected.size} / {JUDGE_SHORTLIST_CAP} selected
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artworks.map((artwork) => (
              <div
                key={artwork._id}
                className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => openPreview('submissions', artworks, artwork)}
                  className="block h-56 w-full cursor-pointer overflow-hidden bg-zinc-100"
                >
                  <img
                    src={artwork.artworkImage}
                    alt={artwork.title}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </button>
                <div className="flex flex-col gap-3 p-4">
                  <div>
                    <h2 className="truncate text-base font-semibold text-zinc-900">
                      {artwork.title}
                    </h2>
                    <p className="truncate text-sm text-zinc-500">
                      {artwork.participant.name} · {artwork.participant.state}
                    </p>
                    <p className="mt-1 truncate text-xs text-zinc-400">{artwork.medium}</p>
                  </div>
                  {renderVoteButton(artwork)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {tab === 'shortlist' && (
        <>
          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              disabled={selected.size === 0 || isSubmitting}
              onClick={() => setConfirmOpen(true)}
              className="inline-flex w-fit cursor-pointer items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 active:bg-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
            >
              Submit shortlist
            </button>
            {selected.size === 0 && (
              <p className="text-xs text-zinc-400">Vote for at least one work before submitting.</p>
            )}
          </div>
          {shortlisted.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center text-zinc-400 shadow-sm">
              You haven&apos;t voted for any works yet. Switch to Submissions to start.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shortlisted.map((artwork) => (
                <div
                  key={artwork._id}
                  className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => openPreview('shortlist', shortlisted, artwork)}
                    className="block h-56 w-full cursor-pointer overflow-hidden bg-zinc-100"
                  >
                    <img
                      src={artwork.artworkImage}
                      alt={artwork.title}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </button>
                  <div className="flex flex-col gap-3 p-4">
                    <div>
                      <h2 className="truncate text-base font-semibold text-zinc-900">
                        {artwork.title}
                      </h2>
                      <p className="truncate text-sm text-zinc-500">
                        {artwork.participant.name} · {artwork.participant.state}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggle(artwork._id)}
                      disabled={pendingId === artwork._id}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X className="size-4" /> Remove from shortlist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={!!previewArtwork} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent
          showClose={false}
          className="inset-6 flex h-auto w-auto max-h-none max-w-none translate-x-0 translate-y-0 flex-col gap-4 rounded-xl"
        >
          {previewArtwork && previewIndex !== null && (
            <div className="flex h-full min-h-0 flex-col gap-4">
              <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-zinc-100">
                <img
                  src={previewArtwork.artworkImage}
                  alt={previewArtwork.title}
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  type="button"
                  onClick={closePreview}
                  aria-label="Close"
                  className="absolute top-4 right-4 flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/90 text-zinc-500 shadow-sm hover:bg-white hover:text-zinc-900"
                >
                  <X className="size-4" />
                </button>
                {previewList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={showPrevPreview}
                      disabled={previewIndex === 0}
                      aria-label="Previous artwork"
                      className="absolute top-1/2 left-4 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-zinc-500 shadow-sm hover:bg-white hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/90 disabled:hover:text-zinc-500"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={showNextPreview}
                      disabled={previewIndex === previewList.length - 1}
                      aria-label="Next artwork"
                      className="absolute top-1/2 right-4 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-zinc-500 shadow-sm hover:bg-white hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/90 disabled:hover:text-zinc-500"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </>
                )}
              </div>
              <div className="mt-2 flex shrink-0 items-end justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-zinc-900">
                    {previewArtwork.title}
                  </h2>
                  <p className="truncate text-sm text-zinc-500">
                    {previewArtwork.medium} · {previewArtwork.artworkSize}
                  </p>
                </div>
                <div className="shrink-0">{renderVoteButton(previewArtwork)}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
              className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="cursor-pointer rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit shortlist'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
