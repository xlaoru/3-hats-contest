import { getJudgeBySlug } from '@/lib/actions/judge.action'
import { notFound } from 'next/navigation'

const JudgeGallery = async (props: PageProps<'/judge/[slug]'>) => {
  const { slug } = await props.params
  const { success, data: judge } = await getJudgeBySlug(slug)

  if (!success || !judge) {
    return notFound()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
          {judge.name || `Judge ${judge.index}`}
        </p>
        <h1 className="mt-2 text-xl font-bold text-zinc-900">Judging gallery</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Entries are still being accepted and reviewed. Once judging opens, approved entries will
          appear here for you to shortlist.
        </p>
      </div>
    </div>
  )
}

export default JudgeGallery
