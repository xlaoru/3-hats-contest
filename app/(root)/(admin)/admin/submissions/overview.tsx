import type { ArtworkFilterOptions } from '@/lib/actions/artwork.action'
import { statusLabels, statusStyles } from '@/lib/artwork-status'
import type { ArtworkStatus } from '@/lib/validations'

const statusOrder: ArtworkStatus[] = [
  'pending',
  'clarification',
  'approved',
  'rejected',
  'withdrawn',
]

type OverviewProps = {
  filterOptions: ArtworkFilterOptions
}

export default function Overview({ filterOptions }: OverviewProps) {
  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center gap-6 overflow-x-auto border-b border-zinc-200 px-6 py-4">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-2">
            <h3 className="text-md font-bold text-zinc-900">Overview</h3>
            <h2 className="text-xl font-bold text-zinc-900">{filterOptions.total}</h2>
            <p className="text-sm text-zinc-500">Total submissions</p>
          </div>
          <ul className="flex flex-col gap-2">
            {statusOrder.map((status) => (
              <li key={status} className="flex justify-between">
                <p className="text-sm text-zinc-500 flex items-center gap-2">
                  <span className={`size-2 rounded-full ${statusStyles[status]}`} />{' '}
                  {statusLabels[status]}
                </p>
                <p className="text-sm">{filterOptions.statusCounts[status] ?? 0}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
