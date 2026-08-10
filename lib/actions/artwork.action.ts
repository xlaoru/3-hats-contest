'use server'

import { auth } from '@/auth'
import Artwork, { IArtwork, IArtworkDoc } from '@/database/artwork.model'
import JudgeVote from '@/database/judgeVote.model'
import Participant, { IParticipantDoc } from '@/database/participant.model'
import { ActionResponse, ErrorResponse } from '@/types/global'
import mongoose from 'mongoose'
import { revalidatePath } from 'next/cache'
import { sendSubmissionVerificationEmail } from '../emails/submission-verification'
import action from '../handlers/action'
import handleError from '../handlers/error'
import { ForbiddenError, NotFoundError } from '../http-errors'
import dbConnect from '../mongoose'
import { createSubmissionVerificationToken, hashToken } from '../tokens'
import {
  ConfirmArtworkSubmissionSchema,
  LikeArtworkSchema,
  SubmitArtworkSchema,
  VerifyArtworkSchema,
} from '../validations'

const SUBMISSION_RESEND_COOLDOWN_MS = 60 * 1000

async function upsertArtworkForParticipant(
  participantId: mongoose.Types.ObjectId,
  data: Omit<IArtwork, 'participant' | 'status'>,
  existingArtwork: IArtworkDoc | null,
  session: mongoose.ClientSession,
): Promise<IArtworkDoc> {
  if (existingArtwork) {
    existingArtwork.set({ ...data, status: 'pending' })
    return existingArtwork.save({ session })
  }

  const [artwork] = await Artwork.create([{ participant: participantId, ...data }], { session })

  return artwork
}

type PopulatedArtwork = Omit<IArtworkDoc, 'participant'> & {
  participant: IParticipantDoc
  judgeLikes: number
  hasVoted?: boolean
}

async function getJudgeLikesCounts(
  artworkIds: mongoose.Types.ObjectId[],
): Promise<Map<string, number>> {
  const counts = await JudgeVote.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
    { $match: { artwork: { $in: artworkIds } } },
    { $group: { _id: '$artwork', count: { $sum: 1 } } },
  ])

  return new Map(counts.map(({ _id, count }) => [_id.toString(), count]))
}

export async function getArtworks(): Promise<ActionResponse<PopulatedArtwork[]>> {
  try {
    await dbConnect()

    const artworks = await Artwork.find().populate<{ participant: IParticipantDoc }>('participant')

    if (!artworks) {
      throw new Error('Artworks not found')
    }

    const judgeLikesCounts = await getJudgeLikesCounts(artworks.map((artwork) => artwork._id))

    const data = artworks.map((artwork) => ({
      ...artwork.toObject(),
      judgeLikes: judgeLikesCounts.get(artwork._id.toString()) ?? 0,
    }))

    return { success: true, data: JSON.parse(JSON.stringify(data)) }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export type PublicArtwork = {
  _id: string
  title: string
  medium: string
  artworkSize: string
  artworkImage: string
  participant: { name: string; state: string }
}

export async function getPublicArtworks(): Promise<ActionResponse<PublicArtwork[]>> {
  try {
    await dbConnect()

    const artworks = await Artwork.find({ isVerified: true })
      .sort({ createdAt: -1 })
      .populate<{ participant: IParticipantDoc }>('participant', 'name state')

    const data: PublicArtwork[] = artworks.map((artwork) => ({
      _id: artwork._id.toString(),
      title: artwork.title,
      medium: artwork.medium,
      artworkSize: artwork.artworkSize,
      artworkImage: artwork.artworkImage,
      participant: {
        name: artwork.participant.name,
        state: artwork.participant.state,
      },
    }))

    return { success: true, data: JSON.parse(JSON.stringify(data)) }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export async function getPublicArtworkById(
  artworkId: string,
): Promise<ActionResponse<PublicArtwork>> {
  try {
    await dbConnect()

    const artwork = await Artwork.findOne({ _id: artworkId, isVerified: true }).populate<{
      participant: IParticipantDoc
    }>('participant', 'name state')

    if (!artwork) {
      throw new NotFoundError('Artwork')
    }

    const data: PublicArtwork = {
      _id: artwork._id.toString(),
      title: artwork.title,
      medium: artwork.medium,
      artworkSize: artwork.artworkSize,
      artworkImage: artwork.artworkImage,
      participant: {
        name: artwork.participant.name,
        state: artwork.participant.state,
      },
    }

    return { success: true, data: JSON.parse(JSON.stringify(data)) }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export async function getArtworkByOwnerEmail(
  ownerEmail: string,
): Promise<ActionResponse<PopulatedArtwork>> {
  try {
    await dbConnect()

    const participant = await Participant.findOne({ email: ownerEmail })

    if (!participant) {
      throw new NotFoundError('Participant')
    }

    const artwork = await Artwork.findOne({ participant: participant._id }).populate<{
      participant: IParticipantDoc
    }>('participant')

    if (!artwork) {
      throw new NotFoundError('Artwork')
    }

    const session = await auth()

    const [judgeLikes, hasVoted] = await Promise.all([
      JudgeVote.countDocuments({ artwork: artwork._id }),
      session?.user?.id
        ? JudgeVote.exists({ judge: session.user.id, artwork: artwork._id })
        : Promise.resolve(false),
    ])

    return {
      success: true,
      data: JSON.parse(
        JSON.stringify({ ...artwork.toObject(), judgeLikes, hasVoted: Boolean(hasVoted) }),
      ),
    }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export async function verifyArtwork(
  params: VerifyArtworkParams,
): Promise<ActionResponse<IArtworkDoc>> {
  const validationResult = await action({
    params,
    schema: VerifyArtworkSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { ownerEmail, status } = validationResult.params!

  const session = await mongoose.startSession()

  session.startTransaction()

  try {
    const participant = await Participant.findOne({ email: ownerEmail }).session(session)

    if (!participant) {
      throw new NotFoundError('Participant')
    }

    const artwork = await Artwork.findOne({ participant: participant._id }).session(session)

    if (!artwork) {
      throw new NotFoundError('Artwork')
    }

    artwork.status = status
    await artwork.save({ session })

    await session.commitTransaction()

    revalidatePath(`/${encodeURIComponent(ownerEmail)}`)
    revalidatePath('/')

    return { success: true, data: JSON.parse(JSON.stringify(artwork)) }
  } catch (error) {
    await session.abortTransaction()
    return handleError(error) as ErrorResponse
  } finally {
    await session.endSession()
  }
}

export async function judgeLikeArtwork(
  params: LikeArtworkParams,
): Promise<ActionResponse<IArtworkDoc & { judgeLikes: number }>> {
  const validationResult = await action({
    params,
    schema: LikeArtworkSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { ownerEmail } = validationResult.params!
  const judgeId = validationResult.session!.user!.id

  const session = await mongoose.startSession()

  session.startTransaction()

  try {
    const participant = await Participant.findOne({ email: ownerEmail }).session(session)

    if (!participant) {
      throw new NotFoundError('Participant')
    }

    const artwork = await Artwork.findOne({ participant: participant._id }).session(session)

    if (!artwork) {
      throw new NotFoundError('Artwork')
    }

    const existingVote = await JudgeVote.findOne({
      judge: judgeId,
      artwork: artwork._id,
    }).session(session)

    if (existingVote) {
      throw new ForbiddenError('You have already voted for this artwork')
    }

    await JudgeVote.create([{ judge: judgeId, artwork: artwork._id }], { session })

    const judgeLikes = await JudgeVote.countDocuments({ artwork: artwork._id }).session(session)

    await session.commitTransaction()

    revalidatePath(`/${encodeURIComponent(ownerEmail)}`)
    revalidatePath('/')

    return {
      success: true,
      data: JSON.parse(JSON.stringify({ ...artwork.toObject(), judgeLikes })),
    }
  } catch (error) {
    await session.abortTransaction()
    return handleError(error) as ErrorResponse
  } finally {
    await session.endSession()
  }
}

export async function submitArtwork(
  params: SubmitArtworkParams,
): Promise<ActionResponse<{ artworkId: string }>> {
  const validationResult = await action({ params, schema: SubmitArtworkSchema })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const {
    name,
    email,
    state,
    title,
    medium,
    artworkSize,
    venue,
    dateCreated,
    artworkImage,
    proveImage,
    agreedToRules,
  } = validationResult.params!

  const session = await mongoose.startSession()

  session.startTransaction()

  try {
    let participant = await Participant.findOne({ email }).session(session)
    let existingArtwork: IArtworkDoc | null = null

    if (participant) {
      existingArtwork = await Artwork.findOne({ participant: participant._id }).session(session)

      if (existingArtwork && participant.emailVerifiedAt) {
        throw new ForbiddenError('You have already submitted an entry for this competition')
      }

      if (
        existingArtwork &&
        Date.now() - participant.updatedAt.getTime() < SUBMISSION_RESEND_COOLDOWN_MS
      ) {
        throw new ForbiddenError(
          'Please wait a moment before requesting another confirmation email',
        )
      }

      participant.name = name
      participant.state = state
    } else {
      ;[participant] = await Participant.create([{ name, email, state }], { session })
    }

    const artwork = await upsertArtworkForParticipant(
      participant._id,
      {
        title,
        medium,
        artworkSize,
        venue,
        dateCreated,
        artworkImage,
        proveImage,
        agreedToRules,
      },
      existingArtwork,
      session,
    )

    const { token, tokenHash, expiresAt } = createSubmissionVerificationToken()

    participant.emailVerifiedAt = null
    participant.verificationTokenHash = tokenHash
    participant.verificationTokenExpiresAt = expiresAt
    await participant.save({ session })

    await session.commitTransaction()

    const confirmUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/artworks/confirm?token=${token}`

    await sendSubmissionVerificationEmail({
      to: participant.email,
      artworkTitle: artwork.title,
      confirmUrl,
    })

    revalidatePath('/artworks')

    return { success: true, data: { artworkId: artwork._id.toString() } }
  } catch (error) {
    await session.abortTransaction()
    return handleError(error) as ErrorResponse
  } finally {
    await session.endSession()
  }
}

export async function confirmArtworkSubmission(
  params: ConfirmArtworkSubmissionParams,
): Promise<ActionResponse<{ artworkId: string; artworkTitle: string }>> {
  const validationResult = await action({ params, schema: ConfirmArtworkSubmissionSchema })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { token } = validationResult.params!

  try {
    const tokenHash = hashToken(token)

    const participant = await Participant.findOne({ verificationTokenHash: tokenHash })

    if (!participant) {
      throw new NotFoundError('Confirmation link')
    }

    const artwork = await Artwork.findOne({ participant: participant._id })

    if (!artwork) {
      throw new NotFoundError('Artwork')
    }

    // Already confirmed (e.g. a repeat click, or an email client prefetching the
    // link) — the token stays valid as a lookup key even after use, so this is a
    // no-op that just re-reports success instead of erroring.
    if (!participant.emailVerifiedAt) {
      if (
        !participant.verificationTokenExpiresAt ||
        participant.verificationTokenExpiresAt.getTime() < Date.now()
      ) {
        throw new ForbiddenError(
          'This confirmation link has expired, please submit your entry again',
        )
      }

      participant.emailVerifiedAt = new Date()
      await participant.save()
    }

    return {
      success: true,
      data: { artworkId: artwork._id.toString(), artworkTitle: artwork.title },
    }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}
