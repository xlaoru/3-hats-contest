'use client'

import { requestPublicVote } from '@/lib/actions/publicVote.action'
import { useState, useTransition } from 'react'

type VoteFormProps = {
  artworkId: string
}

type Step = 'idle' | 'email' | 'sent'

const VoteForm = ({ artworkId }: VoteFormProps) => {
  const [step, setStep] = useState<Step>('idle')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    startTransition(async () => {
      const result = await requestPublicVote({ artworkId, email })

      if (result.success) {
        setError(null)
        setStep('sent')
      } else {
        setError(result.error?.message ?? 'Something went wrong, please try again')
      }
    })
  }

  if (step === 'sent') {
    return (
      <div className="rounded-lg bg-green-50 border border-green-100 p-4 text-sm text-green-700">
        Check your inbox — we sent a link to <strong>{email}</strong> to confirm your vote.
      </div>
    )
  }

  if (step === 'email') {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? 'Sending…' : 'Send verification email'}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setStep('email')}
      className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors"
    >
      Vote for this artwork
    </button>
  )
}

export default VoteForm
