import { auth } from '@/auth'
import { getJudges } from '@/lib/actions/judge.action'
import { Info, Lock } from 'lucide-react'
import { redirect } from 'next/navigation'
import JudgesTable from './judges-table'

const Judging = async () => {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/')
  }

  const { success, data } = await getJudges()
  const judges = success && data ? data : []
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

  return (
    <div className="min-h-screen bg-zinc-100 px-4 pt-15 pb-4 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-900">Judging</h1>
        <p className="text-sm text-zinc-700">
          Share the judging links below with each judge. Each judge uses their link to view approved
          entries and manage their shortlist.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4">
        <Info className="mt-0.5 size-5 shrink-0 text-zinc-400" />
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-semibold text-zinc-900">
            Judges use their unique link to access the judging dashboard.
          </p>
          <p className="text-sm text-zinc-500">You can copy the link or open it to view.</p>
        </div>
      </div>

      <JudgesTable
        judges={judges.map((judge) => ({ ...judge, link: `${baseUrl}/judge/${judge.slug}` }))}
      />

      <p className="flex items-center gap-2 text-xs text-zinc-400">
        <Lock className="size-3.5 shrink-0" />
        Judging links are unique and secure. Do not share them with anyone other than the assigned
        judge.
      </p>
    </div>
  )
}

export default Judging
