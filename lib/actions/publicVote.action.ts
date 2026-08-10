'use server'

import Artwork from '@/database/artwork.model'
import PublicVote from '@/database/publicVote.model'
import { sendVoteConfirmationEmail } from '@/lib/emails/vote-confirmation'
import { ActionResponse, ErrorResponse } from '@/types/global'
import action from '../handlers/action'
import handleError from '../handlers/error'
import { ForbiddenError, NotFoundError } from '../http-errors'
import { createVoteToken, hashToken } from '../tokens'
import { ConfirmPublicVoteSchema, RequestPublicVoteSchema } from '../validations'

const RESEND_COOLDOWN_MS = 60 * 1000

export async function requestPublicVote(
  params: RequestPublicVoteParams,
): Promise<ActionResponse> {
  const validationResult = await action({ params, schema: RequestPublicVoteSchema })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { artworkId, email } = validationResult.params!
  const normalizedEmail = email.trim().toLowerCase()

  try {
    const artwork = await Artwork.findOne({ _id: artworkId, status: 'approved' })

    if (!artwork) {
      throw new NotFoundError('Artwork')
    }

    const existingVote = await PublicVote.findOne({ email: normalizedEmail })

    if (existingVote?.verifiedAt) {
      throw new ForbiddenError('You have already voted in this competition')
    }

    if (existingVote && Date.now() - existingVote.updatedAt.getTime() < RESEND_COOLDOWN_MS) {
      throw new ForbiddenError('Please wait a moment before requesting another email')
    }

    const { token, tokenHash, expiresAt } = createVoteToken()

    await PublicVote.findOneAndUpdate(
      { email: normalizedEmail },
      { email: normalizedEmail, artwork: artwork._id, tokenHash, expiresAt, verifiedAt: null },
      { upsert: true },
    )

    const confirmUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/vote/confirm?token=${token}`

    await sendVoteConfirmationEmail({
      to: normalizedEmail,
      artworkTitle: artwork.title,
      confirmUrl,
    })

    return { success: true }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export async function confirmPublicVote(
  params: ConfirmPublicVoteParams,
): Promise<ActionResponse<{ artworkId: string; artworkTitle: string }>> {
  const validationResult = await action({ params, schema: ConfirmPublicVoteSchema })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { token } = validationResult.params!

  try {
    const tokenHash = hashToken(token)

    const vote = await PublicVote.findOne({ tokenHash }).populate<{
      artwork: { _id: string; title: string }
    }>('artwork')

    if (!vote) {
      throw new NotFoundError('Vote link')
    }

    // Already confirmed (e.g. a repeat click, or an email client prefetching the
    // link) — the token stays valid as a lookup key even after use, so this is a
    // no-op that just re-reports success instead of erroring.
    if (!vote.verifiedAt) {
      if (!vote.expiresAt || vote.expiresAt.getTime() < Date.now()) {
        throw new ForbiddenError('This vote link has expired, please request a new one')
      }

      vote.verifiedAt = new Date()
      await vote.save()
    }

    return {
      success: true,
      data: {
        artworkId: vote.artwork._id.toString(),
        artworkTitle: vote.artwork.title,
      },
    }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}
