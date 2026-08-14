'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { updateArtworkStatus } from '@/lib/actions/artwork.action'
import type { ArtworkStatus } from '@/lib/validations'
import { Check, CircleMinus, CircleQuestionMark, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type ArtworkActionsProps = {
  artworkId: string
  status: ArtworkStatus
}

const actions: {
  status: ArtworkStatus
  label: string
  pendingLabel: string
  icon: React.ReactNode
  primary?: boolean
}[] = [
    {
      status: 'approved',
      label: 'Approve & Publish',
      pendingLabel: 'Approving...',
      icon: <Check />,
      primary: true,
    },
    {
      status: 'clarification',
      label: 'Request Clarification',
      pendingLabel: 'Requesting...',
      icon: <CircleQuestionMark />,
    },
    { status: 'rejected', label: 'Reject', pendingLabel: 'Rejecting...', icon: <X /> },
    { status: 'withdrawn', label: 'Withdraw', pendingLabel: 'Withdrawing...', icon: <CircleMinus /> },
  ]

export default function ArtworkActions({ artworkId, status }: ArtworkActionsProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [pendingStatus, setPendingStatus] = useState<ArtworkStatus | null>(null)
  const [confirmWithdrawOpen, setConfirmWithdrawOpen] = useState(false)

  const handleChange = (nextStatus: ArtworkStatus) => {
    if (nextStatus === status || isPending) return

    setPendingStatus(nextStatus)
    startTransition(async () => {
      const result = await updateArtworkStatus({ artworkId, status: nextStatus })

      if (result.success) {
        setError(null)
        router.refresh()
      } else {
        setError(result.error?.message ?? "Couldn't update status, please try again")
      }
      setPendingStatus(null)
    })
  }

  const handleActionClick = (nextStatus: ArtworkStatus) => {
    if (nextStatus === 'withdrawn') {
      setConfirmWithdrawOpen(true)
      return
    }
    handleChange(nextStatus)
  }

  const handleConfirmWithdraw = () => {
    setConfirmWithdrawOpen(false)
    handleChange('withdrawn')
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {actions.map((action) => (
          <Button
            key={action.status}
            className={`cursor-pointer rounded-lg border border-zinc-200 px-3 py-2 text-sm ${action.primary ? '' : 'text-zinc-700 bg-white'}`}
            variant={action.primary ? undefined : 'secondary'}
            disabled={isPending || status === action.status}
            onClick={() => handleActionClick(action.status)}
          >
            {action.icon}
            {isPending && pendingStatus === action.status ? action.pendingLabel : action.label}
          </Button>
        ))}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}

      <Dialog open={confirmWithdrawOpen} onOpenChange={setConfirmWithdrawOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Withdraw submission?</DialogTitle>
            <DialogDescription>Are you sure you want to withdraw this submission?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <button
              type="button"
              onClick={() => setConfirmWithdrawOpen(false)}
              className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmWithdraw}
              className="cursor-pointer rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
            >
              Confirm withdraw
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
