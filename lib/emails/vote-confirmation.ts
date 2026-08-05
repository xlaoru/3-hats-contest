import { resend } from '../resend'

type SendVoteConfirmationEmailParams = {
  to: string
  artworkTitle: string
  confirmUrl: string
}

export async function sendVoteConfirmationEmail({
  to,
  artworkTitle,
  confirmUrl,
}: SendVoteConfirmationEmailParams) {
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[vote] confirm URL for ${to}: ${confirmUrl}`)
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to,
    subject: '3Hats Life Drawing — confirm your People’s Choice vote',
    html: `
      <p>You're almost done voting for "${artworkTitle}" in the 3Hats Life Drawing People's Choice Award.</p>
      <p><a href="${confirmUrl}">Click here to confirm your vote</a></p>
      <p>This link expires in 30 minutes. If you didn't request this, you can ignore this email.</p>
    `,
  })
}
