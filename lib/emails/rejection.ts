import { resend } from '../resend'

type SendRejectionEmailParams = {
  to: string
  message: string
}

export async function sendRejectionEmail({ to, message }: SendRejectionEmailParams) {
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[rejection] email for ${to}: ${message}`)
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to,
    subject: '3Hats Life Drawing — update on your competition entry',
    html: `<p>${message.replace(/\n/g, '<br />')}</p>`,
  })
}
