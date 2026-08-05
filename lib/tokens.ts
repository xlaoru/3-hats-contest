import { createHash, randomBytes } from 'crypto'

const VOTE_TOKEN_TTL_MINUTES = 30

export function createVoteToken() {
  const token = randomBytes(32).toString('hex')
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + VOTE_TOKEN_TTL_MINUTES * 60 * 1000)

  return { token, tokenHash, expiresAt }
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}
