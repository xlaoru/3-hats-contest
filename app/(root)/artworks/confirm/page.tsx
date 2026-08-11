import StateCard from '@/components/state-card'
import { confirmArtworkSubmission } from '@/lib/actions/artwork.action'

const backProps = { backHref: '/artworks', backLabel: 'Back to gallery' }

const ConfirmArtworkSubmissionPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) => {
  const { token } = await searchParams

  if (!token) {
    return (
      <StateCard title="Invalid link" {...backProps}>
        This confirmation link is missing its token.
      </StateCard>
    )
  }

  const result = await confirmArtworkSubmission({ token })

  if (!result.success || !result.data) {
    return (
      <StateCard title="Couldn't confirm your entry" {...backProps}>
        {result.error?.message ?? 'This link is invalid or has expired.'}
      </StateCard>
    )
  }

  return (
    <StateCard title="Entry confirmed 🎉" {...backProps}>
      Thanks — your entry <strong>{result.data.artworkTitle}</strong> is confirmed and now waiting
      for admin approval.
    </StateCard>
  )
}

export default ConfirmArtworkSubmissionPage
