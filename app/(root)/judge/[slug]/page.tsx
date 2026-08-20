import { getPublicArtworks } from '@/lib/actions/artwork.action'
import { getJudgeBySlug } from '@/lib/actions/judge.action'
import { notFound } from 'next/navigation'
import JudgeGallery from './judge-gallery'

const JudgeGalleryPage = async (props: PageProps<'/judge/[slug]'>) => {
  const { slug } = await props.params
  const { success, data: judge } = await getJudgeBySlug(slug)

  if (!success || !judge) {
    return notFound()
  }

  const { data: artworks } = await getPublicArtworks()

  return (
    <div className="min-h-screen bg-zinc-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-1">
          <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
            {judge.name || `Judge ${judge.index}`}
          </p>
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-2xl font-bold text-zinc-900">Judging gallery</h1>
          </div>
        </div>

        {!artworks || artworks.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center text-zinc-400 shadow-sm">
            No approved entries yet — check back once judging opens.
          </div>
        ) : (
          <JudgeGallery
            artworks={artworks}
            slug={judge.slug}
            initialShortlist={judge.shortlist}
            initialSubmitted={judge.shortlistSubmittedAt !== null}
          />
        )}
      </div>
    </div>
  )
}

export default JudgeGalleryPage
