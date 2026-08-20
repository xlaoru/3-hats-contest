'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { lockWinners, type WinnerItem, type WinnersData } from '@/lib/actions/winners.action'
import { cn } from '@/lib/utils'
import { CircleCheck, Heart, Lock, Medal, ShieldCheck, Star, Trophy } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState, useTransition } from 'react'

type Props = Omit<WinnersData, 'shortlistReady' | 'winnersAssigned'>

const toneClasses = {
  amber: 'bg-amber-100 text-amber-600',
  zinc: 'bg-zinc-200 text-zinc-600',
  orange: 'bg-orange-100 text-orange-600',
  green: 'bg-green-100 text-green-600',
  blue: 'bg-blue-100 text-blue-600',
} as const

type Tone = keyof typeof toneClasses

export default function WinnersView({
  first,
  second,
  third,
  highlyCommended,
  peoplesChoice,
  locked: initialLocked,
}: Props) {
  const [locked, setLocked] = useState(initialLocked)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const hcSlots: (WinnerItem | null)[] = [0, 1].map((i) => highlyCommended[i] ?? null)

  const handleLock = () => {
    setError(null)
    startTransition(async () => {
      const result = await lockWinners()

      setConfirmOpen(false)

      if (result.success) {
        setLocked(true)
      } else {
        setError(result.error?.message ?? "Couldn't lock winners, please try again")
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <WinnerCard icon={<Trophy className="size-4" />} tone="amber" label="First Prize" item={first} />
        <WinnerCard icon={<Medal className="size-4" />} tone="zinc" label="Second Prize" item={second} />
        <WinnerCard icon={<Medal className="size-4" />} tone="orange" label="Third Prize" item={third} />
        <WinnerCard
          icon={<Star className="size-4" />}
          tone="green"
          label="Highly Commended 1"
          item={hcSlots[0]}
        />
        <WinnerCard
          icon={<Star className="size-4" />}
          tone="green"
          label="Highly Commended 2"
          item={hcSlots[1]}
        />
        <WinnerCard
          icon={<Heart className="size-4" />}
          tone="blue"
          label="People's Choice"
          item={peoplesChoice}
        />
      </div>

      {locked ? (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-zinc-900">Winners confirmed and locked</p>
            <p className="text-sm text-zinc-600">
              These results are now official and displayed on the public site.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-zinc-400" />
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-zinc-900">Ready to confirm?</p>
              <p className="text-sm text-zinc-600">
                This will set these winners as the official results of the competition. They will
                be displayed on the public site.
              </p>
              <p className="text-sm text-zinc-600">
                Once you confirm the winners, they will be locked and cannot be changed. This
                action cannot be undone.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={isPending}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Lock className="size-4" />
            Confirm and lock winners
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm and lock winners?</DialogTitle>
            <DialogDescription>
              This will publish the winners above as the official results of the competition on
              the public site. Once confirmed, they will be locked and this action cannot be
              undone.
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
              onClick={handleLock}
              disabled={isPending}
              className="cursor-pointer rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {isPending ? 'Confirming...' : 'Confirm and lock winners'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function WinnerCard({
  icon,
  tone,
  label,
  item,
}: {
  icon: ReactNode
  tone: Tone
  label: string
  item: WinnerItem | null
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', toneClasses[tone])}>
          {icon}
        </span>
        <h3 className="font-semibold text-zinc-900">{label}</h3>
      </div>

      {item ? (
        <div className="flex items-center gap-3">
          <img
            src={item.artworkImage}
            alt={item.title}
            className="size-20 shrink-0 rounded-lg bg-zinc-100 object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-zinc-900">{item.title}</p>
            <p className="truncate text-sm text-zinc-500">by {item.participantName}</p>
            <p className="truncate text-sm text-zinc-500">{item.medium}</p>
            <p className="truncate text-sm text-zinc-500">{item.artworkSize}</p>
          </div>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-zinc-300 p-3 text-center text-sm text-zinc-400">
          Not assigned yet
        </p>
      )}
    </div>
  )
}
