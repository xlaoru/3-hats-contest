import StateCard from '@/components/state-card'
import { confirmPublicVote } from '@/lib/actions/publicVote.action'

const backProps = { backHref: '/', backLabel: 'Back to home' }

const VoteConfirmPage = async ({ searchParams }: { searchParams: Promise<{ token?: string }> }) => {
  const { token } = await searchParams

  if (!token) {
    return (
      <StateCard title="Invalid link" {...backProps}>
        This vote confirmation link is missing its token.
      </StateCard>
    )
  }

  const result = await confirmPublicVote({ token })

  if (!result.success || !result.data) {
    return (
      <StateCard title="Couldn't confirm your vote" {...backProps}>
        {result.error?.message ?? 'This link is invalid or has expired.'}
      </StateCard>
    )
  }

  return (
    <StateCard title="Vote confirmed 🎉" {...backProps}>
      Thanks — your vote for <strong>{result.data.artworkTitle}</strong> has been counted in the
      People&apos;s Choice Award.
    </StateCard>
  )
}

export default VoteConfirmPage
