import { auth } from '@/auth'
import { getCombinedShortlist } from '@/lib/actions/combinedShortlist.action'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import CombinedShortlistView from './combined-shortlist-view'

const CombinedShortlistPage = async () => {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/')
  }

  const { success, data } = await getCombinedShortlist()

  if (!success || !data) {
    redirect('/admin/judging')
  }

  return (
    <div className="min-h-screen bg-zinc-100 px-4 pt-15 pb-4 flex flex-col gap-6">
      <Link
        href="/admin/judging"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-700"
      >
        ← Back to judging
      </Link>

      {!data.ready ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-zinc-900">Not ready yet</h1>
          <p className="mt-2 text-sm text-zinc-600">
            The combined shortlist becomes available once all three judges have submitted their
            shortlists.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-zinc-900">Combined shortlist &amp; select winners</h1>
            <p className="max-w-4xl text-sm text-zinc-700">
              All three judges have submitted their shortlists. Below is the combined shortlist
              showing how many judges selected each work.
            </p>
          </div>

          <CombinedShortlistView groups={data.groups} />
        </>
      )}
    </div>
  )
}

export default CombinedShortlistPage
