'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  confirmWinners,
  type CombinedShortlistGroup,
  type CombinedShortlistItem,
} from '@/lib/actions/combinedShortlist.action'
import { cn } from '@/lib/utils'
import { CircleCheck, Eye, Info, Lock, Medal, Star, Trophy, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo, useState, useTransition } from 'react'

type SlotKey = 'first' | 'second' | 'third'

type PickerTarget = SlotKey | 'highlyCommended'

const slotConfig: { key: SlotKey; label: string }[] = [
  { key: 'first', label: 'First Prize' },
  { key: 'second', label: 'Second Prize' },
  { key: 'third', label: 'Third Prize' },
]

const assignOptions: { key: PickerTarget; label: string; icon: ReactNode }[] = [
  { key: 'first', label: 'First Prize', icon: <Trophy className="size-4" /> },
  { key: 'second', label: 'Second Prize', icon: <Medal className="size-4" /> },
  { key: 'third', label: 'Third Prize', icon: <Medal className="size-4" /> },
  { key: 'highlyCommended', label: 'Highly Commended', icon: <Star className="size-4" /> },
]

const assignOptionsByKey = new Map(assignOptions.map((option) => [option.key, option]))

const HIGHLY_COMMENDED_CAP = 5

export default function CombinedShortlistView({ groups }: { groups: CombinedShortlistGroup[] }) {
  const [activeGroup, setActiveGroup] = useState(0)
  const [winners, setWinners] = useState<Record<SlotKey, string | null>>({
    first: null,
    second: null,
    third: null,
  })
  const [highlyCommended, setHighlyCommended] = useState<string[]>([])
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const allItems = useMemo(() => groups.flatMap((group) => group.items), [groups])
  const itemsById = useMemo(
    () => new Map(allItems.map((item) => [item.artworkId, item])),
    [allItems],
  )

  const usedIds = useMemo(() => {
    const ids = new Set<string>()
    Object.values(winners).forEach((id) => id && ids.add(id))
    highlyCommended.forEach((id) => ids.add(id))
    return ids
  }, [winners, highlyCommended])

  const assignAward = (artworkId: string, target: PickerTarget) => {
    setError(null)

    // Reassigning: clear this work out of any prize slot it currently holds.
    setWinners((prev) => {
      const next = { ...prev }
      ;(Object.keys(next) as SlotKey[]).forEach((key) => {
        if (next[key] === artworkId) next[key] = null
      })
      if (target !== 'highlyCommended') next[target] = artworkId
      return next
    })

    setHighlyCommended((prev) => {
      const isAlreadyIn = prev.includes(artworkId)
      const withoutItem = prev.filter((id) => id !== artworkId)

      if (target !== 'highlyCommended') return withoutItem
      if (isAlreadyIn) return prev
      if (withoutItem.length >= HIGHLY_COMMENDED_CAP) {
        setError(`You can only select up to ${HIGHLY_COMMENDED_CAP} Highly Commended works`)
        return prev
      }
      return [...withoutItem, artworkId]
    })

    setPickerTarget(null)
  }

  const awardFor = (artworkId: string): PickerTarget | null => {
    if (winners.first === artworkId) return 'first'
    if (winners.second === artworkId) return 'second'
    if (winners.third === artworkId) return 'third'
    if (highlyCommended.includes(artworkId)) return 'highlyCommended'
    return null
  }

  const clearSlot = (target: SlotKey) => setWinners((prev) => ({ ...prev, [target]: null }))
  const removeHighlyCommended = (artworkId: string) =>
    setHighlyCommended((prev) => prev.filter((id) => id !== artworkId))

  const canConfirm = Boolean(winners.first && winners.second && winners.third) && highlyCommended.length > 0

  const handleConfirm = () => {
    if (!winners.first || !winners.second || !winners.third || highlyCommended.length === 0) return

    setError(null)
    startTransition(async () => {
      const result = await confirmWinners({
        first: winners.first!,
        second: winners.second!,
        third: winners.third!,
        highlyCommended,
      })

      setConfirmOpen(false)

      if (result.success) {
        setConfirmed(true)
      } else {
        setError(result.error?.message ?? "Couldn't save winners, please try again")
      }
    })
  }

  const group = groups[activeGroup]

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center gap-6 overflow-x-auto border-b border-zinc-200 px-6">
          {groups.map((g, index) => (
            <button
              key={g.count}
              type="button"
              onClick={() => setActiveGroup(index)}
              className={cn(
                'shrink-0 cursor-pointer border-b-2 border-transparent py-4 text-sm font-medium text-zinc-500 hover:text-zinc-700',
                activeGroup === index && 'border-zinc-900 text-zinc-900',
              )}
            >
              Selected by {g.count} judge{g.count === 1 ? '' : 's'} ({g.items.length})
            </button>
          ))}
        </div>

        <div className="flex items-start gap-3 bg-blue-50/60 px-6 py-4 text-sm text-blue-800">
          <Info className="mt-0.5 size-4 shrink-0" />
          <p>Works are grouped by how many judges selected them. Start with the highest-consensus picks.</p>
        </div>

        <ul className="divide-y divide-zinc-100">
          {group?.items.map((item, index) => (
            <li
              key={item.artworkId}
              className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-xs font-semibold text-zinc-500">
                {index + 1}
              </span>
              <img
                src={item.artworkImage}
                alt={item.title}
                className="size-16 shrink-0 rounded-lg bg-zinc-100 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-zinc-900">{item.title}</p>
                <p className="truncate text-sm text-zinc-500">
                  {item.medium} · {item.artworkSize}
                </p>
                <p className="truncate text-sm text-zinc-500">
                  By {item.participantName} · {item.participantState}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="flex -space-x-1.5">
                  {item.selectedBy.map((judge) => (
                    <span
                      key={judge.index}
                      title={judge.label}
                      className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-emerald-100 text-[11px] font-semibold text-emerald-700"
                    >
                      J{judge.index}
                    </span>
                  ))}
                </div>
                {awardFor(item.artworkId) && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                    {assignOptionsByKey.get(awardFor(item.artworkId)!)?.icon}
                    {assignOptionsByKey.get(awardFor(item.artworkId)!)?.label}
                  </span>
                )}
                <AssignDropdown
                  artworkId={item.artworkId}
                  currentAward={awardFor(item.artworkId)}
                  onAssign={(target) => assignAward(item.artworkId, target)}
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="flex items-start gap-2 border-t border-zinc-100 px-6 py-4 text-xs text-zinc-400">
          <Lock className="mt-0.5 size-3.5 shrink-0" />
          <p>
            The combined shortlist is based on the works selected by each judge. Use the details view
            to see the full artwork and proof (for verification only).
          </p>
        </div>
      </div>

      <div className="w-full shrink-0 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm lg:sticky lg:top-6 lg:w-80">
        <div className="mb-1 flex items-center gap-2">
          <Trophy className="size-5 text-zinc-900" />
          <h2 className="text-lg font-bold text-zinc-900">Select winners</h2>
        </div>
        <p className="mb-6 text-sm text-zinc-500">
          Choose the winning artworks from the combined shortlist.
        </p>

        {confirmed ? (
          <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            <CircleCheck className="mt-0.5 size-4 shrink-0" />
            <p>Winners confirmed and saved.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-5">
              {slotConfig.map((slot) => (
                <WinnerSlot
                  key={slot.key}
                  label={slot.label}
                  hint="Select 1 work"
                  item={winners[slot.key] ? (itemsById.get(winners[slot.key]!) ?? null) : null}
                  onSelect={() => setPickerTarget(slot.key)}
                  onClear={() => clearSlot(slot.key)}
                />
              ))}

              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  Highly Commended (up to {HIGHLY_COMMENDED_CAP})
                </p>
                <p className="mb-2 text-xs text-zinc-500">Select up to {HIGHLY_COMMENDED_CAP} works</p>
                <div className="flex flex-col gap-2">
                  {highlyCommended.length === 0 && (
                    <p className="rounded-lg border border-dashed border-zinc-300 p-3 text-center text-sm text-zinc-400">
                      No works selected yet
                    </p>
                  )}
                  {highlyCommended.map((id) => {
                    const item = itemsById.get(id)
                    if (!item) return null
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-2 rounded-lg border border-zinc-200 p-2"
                      >
                        <img
                          src={item.artworkImage}
                          alt={item.title}
                          className="size-9 shrink-0 rounded object-cover bg-zinc-100"
                        />
                        <p className="min-w-0 flex-1 truncate text-sm text-zinc-900">{item.title}</p>
                        <button
                          type="button"
                          onClick={() => removeHighlyCommended(id)}
                          className="shrink-0 cursor-pointer text-zinc-400 hover:text-zinc-600"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    )
                  })}
                  {highlyCommended.length < HIGHLY_COMMENDED_CAP && (
                    <button
                      type="button"
                      onClick={() => setPickerTarget('highlyCommended')}
                      className="cursor-pointer rounded-lg border border-dashed border-zinc-300 p-3 text-sm text-zinc-500 hover:border-zinc-400 hover:text-zinc-700"
                    >
                      + Select work
                    </button>
                  )}
                </div>
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            <button
              type="button"
              disabled={!canConfirm || isPending}
              onClick={() => setConfirmOpen(true)}
              className="mt-6 w-full cursor-pointer rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
            >
              Confirm winners
            </button>
            {!canConfirm && (
              <p className="mt-2 text-xs text-zinc-400">
                Please select First, Second, Third and at least one Highly Commended work to
                continue.
              </p>
            )}
          </>
        )}
      </div>

      <PickerDialog
        open={pickerTarget !== null}
        items={allItems}
        usedIds={usedIds}
        onClose={() => setPickerTarget(null)}
        onSelect={(artworkId) => pickerTarget && assignAward(artworkId, pickerTarget)}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm winners?</DialogTitle>
            <DialogDescription>
              This will save the selected winners and Highly Commended works for the competition.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              disabled={isPending}
              className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              className="cursor-pointer rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Confirm winners'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AssignDropdown({
  artworkId,
  currentAward,
  onAssign,
}: {
  artworkId: string
  currentAward: PickerTarget | null
  onAssign: (target: PickerTarget) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
        <Eye className="size-4" /> View details
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 gap-1">
        <a
          href={`/admin/submissions/${artworkId}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpen(false)}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-100"
        >
          <Eye className="size-4" /> View full details
        </a>
        <div className="my-1 border-t border-zinc-100" />
        <p className="px-2 pb-1 text-xs font-semibold text-zinc-400">Assign as...</p>
        {assignOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => {
              onAssign(option.key)
              setOpen(false)
            }}
            className={cn(
              'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-zinc-100',
              currentAward === option.key ? 'font-semibold text-zinc-900' : 'text-zinc-700',
            )}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

function WinnerSlot({
  label,
  hint,
  item,
  onSelect,
  onClear,
}: {
  label: string
  hint: string
  item: CombinedShortlistItem | null
  onSelect: () => void
  onClear: () => void
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-zinc-900">{label}</p>
      <p className="mb-2 text-xs text-zinc-500">{hint}</p>
      {item ? (
        <div className="flex items-center gap-2 rounded-lg border border-zinc-200 p-2">
          <img
            src={item.artworkImage}
            alt={item.title}
            className="size-10 shrink-0 rounded object-cover bg-zinc-100"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900">{item.title}</p>
            <p className="truncate text-xs text-zinc-500">By {item.participantName}</p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 cursor-pointer text-zinc-400 hover:text-zinc-600"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onSelect}
          className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-dashed border-zinc-300 p-3 text-sm text-zinc-500 hover:border-zinc-400 hover:text-zinc-700"
        >
          <span className="inline-flex items-center gap-2">
            <Trophy className="size-4" /> No work selected yet
          </span>
          <span className="rounded-md border border-zinc-300 px-2 py-1 text-xs">Select work</span>
        </button>
      )}
    </div>
  )
}

function PickerDialog({
  open,
  items,
  usedIds,
  onClose,
  onSelect,
}: {
  open: boolean
  items: CombinedShortlistItem[]
  usedIds: Set<string>
  onClose: () => void
  onSelect: (artworkId: string) => void
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Select a work</DialogTitle>
          <DialogDescription>Choose a work from the combined shortlist.</DialogDescription>
        </DialogHeader>
        <div className="flex max-h-96 flex-col gap-2 overflow-y-auto pt-2">
          {items.map((item) => {
            const disabled = usedIds.has(item.artworkId)
            return (
              <button
                key={item.artworkId}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(item.artworkId)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 p-2 text-left hover:bg-zinc-50',
                  disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent',
                )}
              >
                <img
                  src={item.artworkImage}
                  alt={item.title}
                  className="size-10 shrink-0 rounded object-cover bg-zinc-100"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">{item.title}</p>
                  <p className="truncate text-xs text-zinc-500">
                    By {item.participantName} · Selected by {item.selectedBy.length} judge
                    {item.selectedBy.length === 1 ? '' : 's'}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
