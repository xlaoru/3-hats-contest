'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import OAuthButtons from '@/components/oauth-buttons'
import { signInWithCredentials } from '@/lib/actions/auth.action'

export default function SignIn() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await signInWithCredentials({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      })

      if (result.success) {
        setError(null)
        router.push('/')
      } else {
        setError(result.error?.message ?? 'Something went wrong, please try again')
      }
    })
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-7">Sign In</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
        />
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? 'Signing in…' : 'Sign In'}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      <p className="mt-5 text-sm text-gray-500 text-center">
        No account? <Link href="/sign-up">Sign Up</Link>
      </p>

      <OAuthButtons />
    </div>
  )
}
