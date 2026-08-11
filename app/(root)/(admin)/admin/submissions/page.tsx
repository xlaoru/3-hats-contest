import { auth } from '@/auth'
import { getArtworkFilterOptions, getArtworks } from '@/lib/actions/artwork.action'
import { getCompetitionDates } from '@/lib/actions/competitionDate.action'
import { ArtworkStatus } from '@/lib/validations'
import { notFound, redirect } from 'next/navigation'
import CompetitionTimeline from './competition-timeline'
import Overview from './overview'
import QuickActions from './quick-actions'
import Table from './table'

const PAGE_SIZE = 10

const closeDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function parseList(value: string | string[] | undefined): string[] | undefined {
  const raw = Array.isArray(value) ? value.join(',') : value
  const list = raw
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return list && list.length > 0 ? list : undefined
}

function parseDate(value: string | string[] | undefined): Date | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw) return undefined
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? undefined : date
}

const Artworks = async (props: PageProps<'/admin/submissions'>) => {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/')
  }

  const searchParams = await props.searchParams
  const page = Number(searchParams.page) || 1
  const query = typeof searchParams.query === 'string' ? searchParams.query : undefined
  const status = parseList(searchParams.status) as ArtworkStatus[] | undefined
  const regions = parseList(searchParams.region)
  const mediums = parseList(searchParams.medium)
  const dateFrom = parseDate(searchParams.dateFrom)
  const dateTo = parseDate(searchParams.dateTo)

  const [{ success, data }, filterOptionsResult, competitionDatesResult] = await Promise.all([
    getArtworks({ page, pageSize: PAGE_SIZE, query, status, regions, mediums, dateFrom, dateTo }),
    getArtworkFilterOptions(),
    getCompetitionDates(),
  ])

  if (!success || !data) {
    return notFound()
  }

  const filterOptions =
    filterOptionsResult.success && filterOptionsResult.data
      ? filterOptionsResult.data
      : { statusCounts: {} as Record<ArtworkStatus, number>, total: 0, regions: [], mediums: [] }

  const competitionDates =
    competitionDatesResult.success && competitionDatesResult.data ? competitionDatesResult.data : []

  const entriesClose = competitionDates.find((item) => item.name === 'Entries close')

  return (
    <div className="min-h-screen bg-zinc-100 px-6 py-10 flex flex-col gap-8">
      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-zinc-900">Submissions</h1>
            <p className="text-sm text-zinc-700">Manage and review all competition entries.</p>
          </div>
          <div className="flex flex-row items-center gap-4">
            <span className="text-sm px-3 py-1 bg-zinc-200 border border-zinc-300 rounded-full flex gap-2 items-center">
              <span className="size-2 bg-green-600 rounded-full" /> Entries open
            </span>
            {entriesClose && (
              <p className="text-sm text-zinc-500">
                Closes {closeDateFormatter.format(new Date(entriesClose.date))}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-6">
        <div className="w-[75%] min-w-0">
          <Table
            artworks={data.artworks}
            total={data.total}
            isNext={data.isNext}
            page={page}
            pageSize={PAGE_SIZE}
            filterOptions={filterOptions}
          />
        </div>
        <div className="w-[25%] min-w-0 flex flex-col gap-6">
          <Overview filterOptions={filterOptions} />
          <QuickActions filterOptions={filterOptions} />
          <CompetitionTimeline dates={competitionDates} />
        </div>
      </div>
    </div>
  )
}

export default Artworks
