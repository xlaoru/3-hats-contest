import { fetchHandler } from './handlers/fetch'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'

export const api = {
  auth: {
    oAuthSignIn: ({ user, provider, providerAccountId }: SignInWithOAuthParams) =>
      fetchHandler(`${API_BASE_URL}/auth/sign-in-with-oauth`, {
        method: 'POST',
        body: JSON.stringify({
          user,
          provider,
          providerAccountId,
        }),
      }),
  },
  users: {
    getById: (id: string) => fetchHandler(`${API_BASE_URL}/users/${id}`),
  },
  accounts: {
    getByProvider: (providerAccountId: string) =>
      fetchHandler(`${API_BASE_URL}/accounts/provider`, {
        method: 'POST',
        body: JSON.stringify({ providerAccountId }),
      }),
  },
}
