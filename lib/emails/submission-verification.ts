import { resend } from '../resend'

type SendSubmissionVerificationEmailParams = {
  to: string
  artworkTitle: string
  confirmUrl: string
}

export async function sendSubmissionVerificationEmail({
  to,
  artworkTitle,
  confirmUrl,
}: SendSubmissionVerificationEmailParams) {
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[submission] confirm URL for ${to}: ${confirmUrl}`)
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to,
    subject: '3Hats Life Drawing — confirm your competition entry',
    html: `
      <p>Thanks for submitting "${artworkTitle}" to the 3Hats Life Drawing competition.</p>
      <p><a href="${confirmUrl}">Click here to confirm your email and finish your entry</a></p>
      <p>This link expires in 60 minutes. If you didn't submit this entry, you can ignore this email.</p>
    `,
  })
}
