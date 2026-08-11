import { type ArtworkStatus } from '@/lib/validations'

export const statusLabels: Record<ArtworkStatus, string> = {
  pending: 'Pending review',
  clarification: 'Clarification required',
  approved: 'Approved',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

export const statusStyles: Record<ArtworkStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  clarification: 'bg-violet-100 text-violet-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-zinc-200 text-zinc-600',
}
