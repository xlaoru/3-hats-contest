import { createHash, randomBytes } from 'crypto'

const VOTE_TOKEN_TTL_MINUTES = 30
const SUBMISSION_TOKEN_TTL_MINUTES = 60

function createToken(ttlMinutes: number) {
  const token = randomBytes(32).toString('hex')
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000)

  return { token, tokenHash, expiresAt }
}

export function createVoteToken() {
  return createToken(VOTE_TOKEN_TTL_MINUTES)
}

export function createSubmissionVerificationToken() {
  return createToken(SUBMISSION_TOKEN_TTL_MINUTES)
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}
