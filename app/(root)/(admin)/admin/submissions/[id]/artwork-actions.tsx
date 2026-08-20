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
import { rejectArtwork, updateArtworkStatus } from '@/lib/actions/artwork.action'
import type { ArtworkStatus } from '@/lib/validations'
import { Check, CircleMinus, CircleQuestionMark, Info, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'

type ArtworkActionsProps = {
  artworkId: string
  status: ArtworkStatus
}

const REJECTION_MESSAGE_MAX_LENGTH = 1000

const rejectionReasons: { value: string; template: string }[] = [
  {
    value: 'Ineligible artwork or participant',
    template: `Thank you for your submission to the 3HATS Life Drawing Competition.

After careful review, we regret to inform you that your artwork or participant details do not meet the eligibility criteria for this competition and will not be accepted.

Please review the rules and requirements and feel free to contact us if you have any questions.

Kind regards,
3HATS Team`,
  },
  {
    value: 'Insufficient proof',
    template: `Thank you for your submission to the 3HATS Life Drawing Competition.

After careful review, we regret to inform you that the proof provided with your entry was insufficient to verify it meets the competition requirements, and it will not be accepted.

Please contact us if you have additional documentation to support your submission.

Kind regards,
3HATS Team`,
  },
  {
    value: 'Poor image quality',
    template: `Thank you for your submission to the 3HATS Life Drawing Competition.

After careful review, we regret to inform you that the submitted images do not meet the required quality standards and will not be accepted.

Please feel free to resubmit with higher-quality images.

Kind regards,
3HATS Team`,
  },
]

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

  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectMessage, setRejectMessage] = useState('')
  const [rejectError, setRejectError] = useState<string | null>(null)
  const lastAutoMessage = useRef('')

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
    if (nextStatus === 'rejected') {
      setRejectReason('')
      setRejectMessage('')
      setRejectError(null)
      lastAutoMessage.current = ''
      setRejectOpen(true)
      return
    }
    handleChange(nextStatus)
  }

  const handleConfirmWithdraw = () => {
    setConfirmWithdrawOpen(false)
    handleChange('withdrawn')
  }

  const handleRejectReasonChange = (value: string) => {
    setRejectReason(value)

    const template = rejectionReasons.find((reason) => reason.value === value)?.template ?? ''

    if (rejectMessage === '' || rejectMessage === lastAutoMessage.current) {
      setRejectMessage(template)
      lastAutoMessage.current = template
    }
  }

  const handleConfirmReject = () => {
    if (!rejectReason || !rejectMessage || isPending) return

    setPendingStatus('rejected')
    startTransition(async () => {
      const result = await rejectArtwork({ artworkId, reason: rejectReason, message: rejectMessage })

      if (result.success) {
        setError(null)
        setRejectOpen(false)
        router.refresh()
      } else {
        setRejectError(result.error?.message ?? "Couldn't reject submission, please try again")
      }
      setPendingStatus(null)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 flex-wrap">
        {actions
          .filter((action) => action.status !== status)
          .map((action) => (
            <Button
              key={action.status}
              className={`cursor-pointer rounded-lg border border-zinc-200 px-3 py-2 text-sm ${action.primary ? '' : 'text-zinc-700 bg-white'}`}
              variant={action.primary ? undefined : 'secondary'}
              disabled={isPending}
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

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reject submission</DialogTitle>
            <DialogDescription>This submission will be marked as Rejected.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-4">
            <div>
              <label className="block text-sm text-zinc-500 mb-1">Reason for rejection *</label>
              <select
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                value={rejectReason}
                onChange={(e) => handleRejectReasonChange(e.target.value)}
              >
                <option value="" disabled>
                  Select a reason
                </option>
                {rejectionReasons.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-500 mb-1">Message to artist *</label>
              <p className="text-xs text-zinc-400 mb-2">This message will be sent to the artist by email.</p>
              <textarea
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                rows={7}
                maxLength={REJECTION_MESSAGE_MAX_LENGTH}
                value={rejectMessage}
                onChange={(e) => setRejectMessage(e.target.value)}
              />
              <p className="text-right text-xs text-zinc-400 mt-1">
                {rejectMessage.length} / {REJECTION_MESSAGE_MAX_LENGTH}
              </p>
            </div>
            <div className="flex gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
              <Info size={16} className="shrink-0 mt-0.5" />
              <p>The artist will be notified by email that their submission has been rejected.</p>
            </div>
            {rejectError && <p className="text-sm text-red-600">{rejectError}</p>}
          </div>
          <DialogFooter className="pt-4">
            <button
              type="button"
              onClick={() => setRejectOpen(false)}
              disabled={isPending}
              className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReject}
              disabled={isPending || !rejectReason || !rejectMessage}
              className="cursor-pointer rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {isPending && pendingStatus === 'rejected' ? 'Rejecting...' : 'Confirm rejection'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
