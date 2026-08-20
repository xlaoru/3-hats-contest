import { auth } from '@/auth'
import { getWinners } from '@/lib/actions/winners.action'
import { ArrowRight, Info, Trophy } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import WinnersView from './winners-view'

const WinnersPage = async () => {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/')
  }

  const { success, data } = await getWinners()

  if (!success || !data) {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-zinc-100 px-4 pt-15 pb-4 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-900">Winners</h1>
        <p className="text-sm text-zinc-700">
          The final list of winning artworks will be posted here. Review the selections before
          confirming.
        </p>
      </div>

      {data.winnersAssigned ? (
        <WinnersView
          first={data.first}
          second={data.second}
          third={data.third}
          highlyCommended={data.highlyCommended}
          peoplesChoice={data.peoplesChoice}
          locked={data.locked}
        />
      ) : (
        <>
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-20 text-center">
            <div className="mb-2 flex size-24 items-center justify-center rounded-full bg-zinc-50">
              <Trophy className="size-10 text-zinc-300" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900">No winners selected yet</h2>

            {data.shortlistReady && (
              <>
                <p className="max-w-sm text-sm text-zinc-500">
                  Go to the combined shortlist and select the artwork for each prize to determine
                  the final winners.
                </p>
                <Link
                  href="/admin/judging/combined-shortlist"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  Go to combined shortlist
                  <ArrowRight className="size-4" />
                </Link>
              </>
            )}
          </div>

          {data.shortlistReady && (
            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-800">
              <Info className="mt-0.5 size-4 shrink-0" />
              <div className="flex flex-col gap-1">
                <p className="font-semibold">How it works</p>
                <p>
                  Select one artwork for First, Second, Third, and up to 2 Highly Commended
                  awards, plus one for People&apos;s Choice.
                </p>
                <p>Once all winners are selected, review them on this page and confirm from here.</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default WinnersPage
