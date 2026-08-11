import { Button } from '@/components/ui/button'
import type { ArtworkFilterOptions } from '@/lib/actions/artwork.action'
import Link from 'next/link'

type QuickActionsProps = {
  filterOptions: ArtworkFilterOptions
}

export default function QuickActions({ filterOptions }: QuickActionsProps) {
  const pendingCount = filterOptions.statusCounts.pending ?? 0
  const clarificationCount = filterOptions.statusCounts.clarification ?? 0

  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center gap-6 overflow-x-auto border-b border-zinc-200 px-6 py-4">
        <div className="flex flex-col gap-2 w-full">
          <h3 className="text-md font-bold text-zinc-900">Quick actions</h3>
          <Button
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            nativeButton={false}
            render={<Link href="/admin/submissions?status=pending" />}
          >
            Review Pendings ({pendingCount})
          </Button>
          <Button
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 bg-white"
            nativeButton={false}
            variant="secondary"
            render={<Link href="/admin/submissions?status=clarification" />}
          >
            View clarifications ({clarificationCount})
          </Button>
          <Button
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 bg-white"
            nativeButton={false}
            variant="secondary"
            render={<Link href="/admin/submissions" />}
          >
            View all submissions
          </Button>
        </div>
      </div>
    </div>
  )
}
