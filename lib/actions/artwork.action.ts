'use server'

import Artwork, { IArtwork, IArtworkDoc } from '@/database/artwork.model'
import JudgeVote from '@/database/judgeVote.model'
import Participant, { IParticipantDoc } from '@/database/participant.model'
import { ActionResponse, ErrorResponse } from '@/types/global'
import mongoose, { QueryFilter } from 'mongoose'
import { revalidatePath } from 'next/cache'
import { sendRejectionEmail } from '../emails/rejection'
import { sendSubmissionVerificationEmail } from '../emails/submission-verification'
import action from '../handlers/action'
import handleError from '../handlers/error'
import { ForbiddenError, NotFoundError, ValidationError } from '../http-errors'
import dbConnect from '../mongoose'
import { createSubmissionVerificationToken, hashToken } from '../tokens'
import { escapeRegExp } from '../utils'
import {
  AddArtworkNoteSchema,
  ArtworkStatus,
  ArtworkStatusEnum,
  ConfirmArtworkSubmissionSchema,
  DeleteArtworkNoteSchema,
  GetArtworksSchema,
  LikeArtworkSchema,
  RejectArtworkSchema,
  SubmitArtworkSchema,
  UpdateArtworkDetailsSchema,
  UpdateArtworkNoteSchema,
  UpdateArtworkStatusSchema,
  VerifyArtworkSchema,
} from '../validations'

const SUBMISSION_RESEND_COOLDOWN_MS = 60 * 1000

async function upsertArtworkForParticipant(
  participantId: mongoose.Types.ObjectId,
  data: Omit<IArtwork, 'participant' | 'status' | 'notes'>,
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

export type PopulatedArtwork = Omit<IArtworkDoc, 'participant' | '_id'> & {
  _id: string
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

export type PaginatedArtworks = {
  artworks: PopulatedArtwork[]
  isNext: boolean
  total: number
}

export async function getArtworks(
  params: GetArtworksParams = {},
): Promise<ActionResponse<PaginatedArtworks>> {
  const validationResult = await action({
    params,
    schema: GetArtworksSchema,
  })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { page, pageSize, query, status, regions, mediums, dateFrom, dateTo } =
    validationResult.params!

  const skip = (page! - 1) * pageSize!
  const limit = pageSize!

  const andConditions: QueryFilter<typeof Artwork>[] = []

  if (status && status.length > 0) {
    andConditions.push({ status: { $in: status } })
  }

  if (mediums && mediums.length > 0) {
    andConditions.push({
      medium: {
        $regex: mediums.map(escapeRegExp).join('|'),
        $options: 'i',
      },
    })
  }

  if (dateFrom || dateTo) {
    andConditions.push({
      createdAt: {
        ...(dateFrom ? { $gte: dateFrom } : {}),
        ...(dateTo ? { $lte: dateTo } : {}),
      },
    })
  }

  if (regions && regions.length > 0) {
    const regionParticipants = await Participant.find({ state: { $in: regions } }, '_id').lean()
    andConditions.push({
      participant: { $in: regionParticipants.map((participant) => participant._id) },
    })
  }

  if (query) {
    // Titles live on the artwork, but the search box also promises "name" —
    // that lives on the participant, so it needs its own lookup to join in.
    const escapedQuery = escapeRegExp(query)
    const matchingParticipants = await Participant.find(
      { name: { $regex: escapedQuery, $options: 'i' } },
      '_id',
    ).lean()

    andConditions.push({
      $or: [
        { title: { $regex: escapedQuery, $options: 'i' } },
        { participant: { $in: matchingParticipants.map((participant) => participant._id) } },
      ],
    })
  }

  const filterQuery: QueryFilter<typeof Artwork> =
    andConditions.length > 0 ? { $and: andConditions } : {}

  try {
    const [total, artworks] = await Promise.all([
      Artwork.countDocuments(filterQuery),
      Artwork.find(filterQuery)
        .populate<{ participant: IParticipantDoc }>('participant')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ])

    const judgeLikesCounts = await getJudgeLikesCounts(artworks.map((artwork) => artwork._id))

    const data: PaginatedArtworks = {
      artworks: artworks.map((artwork) => ({
        ...artwork.toObject(),
        judgeLikes: judgeLikesCounts.get(artwork._id.toString()) ?? 0,
      })),
      isNext: total > skip + artworks.length,
      total,
    }

    return { success: true, data: JSON.parse(JSON.stringify(data)) }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export async function getArtworkById(artworkId: string): Promise<ActionResponse<PopulatedArtwork>> {
  try {
    await dbConnect()

    const artwork = await Artwork.findById(artworkId).populate<{
      participant: IParticipantDoc
    }>('participant')

    if (!artwork) {
      throw new NotFoundError('Artwork')
    }

    const judgeLikes = await JudgeVote.countDocuments({ artwork: artwork._id })

    return {
      success: true,
      data: JSON.parse(JSON.stringify({ ...artwork.toObject(), judgeLikes })),
    }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export type ArtworkFilterOptions = {
  statusCounts: Record<ArtworkStatus, number>
  total: number
  regions: string[]
  mediums: string[]
}

export async function getArtworkFilterOptions(): Promise<ActionResponse<ArtworkFilterOptions>> {
  try {
    await dbConnect()

    const [statusAgg, regions, rawMediums] = await Promise.all([
      Artwork.aggregate<{ _id: ArtworkStatus; count: number }>([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Participant.distinct('state'),
      Artwork.distinct('medium'),
    ])

    const statusCounts = Object.fromEntries(
      ArtworkStatusEnum.options.map((option) => [option, 0]),
    ) as Record<ArtworkStatus, number>

    let total = 0
    for (const { _id, count } of statusAgg) {
      statusCounts[_id] = count
      total += count
    }

    const mediums = Array.from(
      new Set(
        (rawMediums as string[])
          .flatMap((value) => value.split(','))
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    ).sort()

    return {
      success: true,
      data: {
        statusCounts,
        total,
        regions: (regions as string[]).filter(Boolean).sort(),
        mediums,
      },
    }
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

    const artworks = await Artwork.find({ status: 'approved' })
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

export async function getPublicArtworkById(id: string): Promise<ActionResponse<PublicArtwork>> {
  try {
    await dbConnect()

    const artwork = await Artwork.findOne({ _id: id, status: 'approved' }).populate<{
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

    revalidatePath(`/admin/review/${artwork._id}`)
    revalidatePath('/admin')
    revalidatePath('/artworks')
    revalidatePath(`/artworks/${artwork._id}`)

    return { success: true, data: JSON.parse(JSON.stringify(artwork)) }
  } catch (error) {
    await session.abortTransaction()
    return handleError(error) as ErrorResponse
  } finally {
    await session.endSession()
  }
}

export async function updateArtworkStatus(
  params: UpdateArtworkStatusParams,
): Promise<ActionResponse<IArtworkDoc>> {
  const validationResult = await action({
    params,
    schema: UpdateArtworkStatusSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { artworkId, status } = validationResult.params!

  try {
    const artwork = await Artwork.findById(artworkId)

    if (!artwork) {
      throw new NotFoundError('Artwork')
    }

    artwork.status = status
    await artwork.save()

    revalidatePath(`/admin/submissions/${artworkId}`)
    revalidatePath('/admin/submissions')
    revalidatePath('/artworks')
    revalidatePath(`/artworks/${artworkId}`)

    return { success: true, data: JSON.parse(JSON.stringify(artwork)) }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export async function rejectArtwork(
  params: RejectArtworkParams,
): Promise<ActionResponse<IArtworkDoc>> {
  const validationResult = await action({
    params,
    schema: RejectArtworkSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { artworkId, reason, message } = validationResult.params!
  const author = validationResult.session!.user?.name ?? 'Admin'

  try {
    const artwork = await Artwork.findById(artworkId).populate<{
      participant: IParticipantDoc
    }>('participant')

    if (!artwork) {
      throw new NotFoundError('Artwork')
    }

    artwork.status = 'rejected'
    artwork.notes.push({ text: `Rejected — reason: ${reason}`, author, createdAt: new Date() })
    await artwork.save()

    await sendRejectionEmail({ to: artwork.participant.email, message })

    revalidatePath(`/admin/submissions/${artworkId}`)
    revalidatePath('/admin/submissions')
    revalidatePath('/artworks')
    revalidatePath(`/artworks/${artworkId}`)

    return { success: true, data: JSON.parse(JSON.stringify(artwork)) }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export async function updateArtworkDetails(
  params: UpdateArtworkDetailsParams,
): Promise<ActionResponse<PopulatedArtwork>> {
  const validationResult = await action({
    params,
    schema: UpdateArtworkDetailsSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const {
    artworkId,
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
  } = validationResult.params!

  try {
    const artwork = await Artwork.findById(artworkId)

    if (!artwork) {
      throw new NotFoundError('Artwork')
    }

    const participant = await Participant.findById(artwork.participant)

    if (!participant) {
      throw new NotFoundError('Participant')
    }

    if (email !== participant.email) {
      const emailTaken = await Participant.findOne({ email, _id: { $ne: participant._id } })

      if (emailTaken) {
        throw new ValidationError({ email: ['This email is already used by another participant.'] })
      }
    }

    participant.set({ name, email, state })
    await participant.save()

    artwork.set({ title, medium, artworkSize, venue, dateCreated, artworkImage, proveImage })
    await artwork.save()

    revalidatePath(`/admin/submissions/${artworkId}`)
    revalidatePath('/admin/submissions')
    revalidatePath('/artworks')
    revalidatePath(`/artworks/${artworkId}`)

    const judgeLikes = await JudgeVote.countDocuments({ artwork: artwork._id })

    return {
      success: true,
      data: JSON.parse(
        JSON.stringify({ ...artwork.toObject(), participant: participant.toObject(), judgeLikes }),
      ),
    }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export async function addArtworkNote(
  params: AddArtworkNoteParams,
): Promise<ActionResponse<IArtworkDoc>> {
  const validationResult = await action({
    params,
    schema: AddArtworkNoteSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { artworkId, text } = validationResult.params!
  const author = validationResult.session!.user?.name ?? 'Admin'

  try {
    const artwork = await Artwork.findById(artworkId)

    if (!artwork) {
      throw new NotFoundError('Artwork')
    }

    artwork.notes.push({ text, author, createdAt: new Date() })
    await artwork.save()

    revalidatePath(`/admin/submissions/${artworkId}`)

    return { success: true, data: JSON.parse(JSON.stringify(artwork)) }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export async function updateArtworkNote(
  params: UpdateArtworkNoteParams,
): Promise<ActionResponse<IArtworkDoc>> {
  const validationResult = await action({
    params,
    schema: UpdateArtworkNoteSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { artworkId, noteIndex, text } = validationResult.params!

  try {
    const artwork = await Artwork.findById(artworkId)

    if (!artwork) {
      throw new NotFoundError('Artwork')
    }

    const note = artwork.notes[noteIndex]

    if (!note) {
      throw new NotFoundError('Note')
    }

    note.text = text
    await artwork.save()

    revalidatePath(`/admin/submissions/${artworkId}`)

    return { success: true, data: JSON.parse(JSON.stringify(artwork)) }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export async function deleteArtworkNote(
  params: DeleteArtworkNoteParams,
): Promise<ActionResponse<IArtworkDoc>> {
  const validationResult = await action({
    params,
    schema: DeleteArtworkNoteSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { artworkId, noteIndex } = validationResult.params!

  try {
    const artwork = await Artwork.findById(artworkId)

    if (!artwork) {
      throw new NotFoundError('Artwork')
    }

    if (!artwork.notes[noteIndex]) {
      throw new NotFoundError('Note')
    }

    artwork.notes.splice(noteIndex, 1)
    await artwork.save()

    revalidatePath(`/admin/submissions/${artworkId}`)

    return { success: true, data: JSON.parse(JSON.stringify(artwork)) }
  } catch (error) {
    return handleError(error) as ErrorResponse
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
