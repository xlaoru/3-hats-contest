'use server'

import { randomBytes } from 'crypto'
import { Types } from 'mongoose'
import { revalidatePath } from 'next/cache'

import Artwork from '@/database/artwork.model'
import Judge, { IJudgeDoc } from '@/database/judge.model'
import { JUDGE_COUNT, JUDGE_SHORTLIST_CAP } from '@/lib/judge-constants'
import { ActionResponse, ErrorResponse } from '@/types/global'
import action from '../handlers/action'
import handleError from '../handlers/error'
import { ForbiddenError, NotFoundError } from '../http-errors'
import dbConnect from '../mongoose'
import {
  SubmitJudgeShortlistSchema,
  ToggleJudgeShortlistSchema,
  UpdateJudgeFieldSchema,
} from '../validations'

export type JudgeItem = {
  _id: string
  index: number
  slug: string
  name: string | null
  email: string | null
  shortlist: string[]
  shortlistCount: number
  shortlistSubmittedAt: string | null
}

function toJudgeItem(judge: IJudgeDoc): JudgeItem {
  return {
    _id: judge._id.toString(),
    index: judge.index,
    slug: judge.slug,
    name: judge.name,
    email: judge.email,
    shortlist: judge.shortlist.map((id) => id.toString()),
    shortlistCount: judge.shortlist.length,
    shortlistSubmittedAt: judge.shortlistSubmittedAt ? judge.shortlistSubmittedAt.toISOString() : null,
  }
}

function generateSlug(index: number) {
  return `j${index}-${randomBytes(3).toString('hex')}`
}

async function ensureJudge(index: number): Promise<IJudgeDoc> {
  return Judge.findOneAndUpdate(
    { index },
    { $setOnInsert: { index, slug: generateSlug(index) } },
    { upsert: true, returnDocument: 'after' },
  )
}

export async function getJudges(): Promise<ActionResponse<JudgeItem[]>> {
  try {
    await dbConnect()

    const judges = await Promise.all(
      Array.from({ length: JUDGE_COUNT }, (_, i) => ensureJudge(i + 1)),
    )

    judges.sort((a, b) => a.index - b.index)

    return { success: true, data: judges.map(toJudgeItem) }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export async function getJudgeBySlug(slug: string): Promise<ActionResponse<JudgeItem>> {
  try {
    await dbConnect()

    const judge = await Judge.findOne({ slug })

    if (!judge) {
      throw new NotFoundError('Judging link')
    }

    return { success: true, data: toJudgeItem(judge) }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export async function updateJudgeField(
  params: UpdateJudgeFieldParams,
): Promise<ActionResponse<JudgeItem>> {
  const validationResult = await action({ params, schema: UpdateJudgeFieldSchema, authorize: true })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { judgeId, field, value } = validationResult.params!

  try {
    const judge = await Judge.findById(judgeId)

    if (!judge) {
      throw new NotFoundError('Judge')
    }

    if (field === 'name') {
      judge.name = value === '' ? null : value
    } else {
      judge.email = value === '' ? null : value
    }

    await judge.save()

    revalidatePath('/admin/judging')

    return { success: true, data: toJudgeItem(judge) }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export async function toggleJudgeShortlistArtwork(
  params: ToggleJudgeShortlistParams,
): Promise<ActionResponse<JudgeItem>> {
  const validationResult = await action({ params, schema: ToggleJudgeShortlistSchema })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { slug, artworkId } = validationResult.params!

  try {
    const judge = await Judge.findOne({ slug })

    if (!judge) {
      throw new NotFoundError('Judge')
    }

    if (judge.shortlistSubmittedAt) {
      throw new ForbiddenError('Your shortlist has already been submitted')
    }

    const artworkExists = await Artwork.exists({ _id: artworkId, status: 'approved' })

    if (!artworkExists) {
      throw new NotFoundError('Artwork')
    }

    const alreadyIn = judge.shortlist.some((id: Types.ObjectId) => id.toString() === artworkId)

    if (alreadyIn) {
      judge.shortlist = judge.shortlist.filter((id: Types.ObjectId) => id.toString() !== artworkId)
    } else {
      if (judge.shortlist.length >= JUDGE_SHORTLIST_CAP) {
        throw new ForbiddenError(`You can shortlist up to ${JUDGE_SHORTLIST_CAP} works`)
      }
      judge.shortlist.push(new Types.ObjectId(artworkId))
    }

    await judge.save()

    revalidatePath(`/judge/${slug}`)
    revalidatePath('/admin/judging')
    revalidatePath('/admin/judging/combined-shortlist')

    return { success: true, data: toJudgeItem(judge) }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export async function submitJudgeShortlist(
  params: SubmitJudgeShortlistParams,
): Promise<ActionResponse<JudgeItem>> {
  const validationResult = await action({ params, schema: SubmitJudgeShortlistSchema })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { slug } = validationResult.params!

  try {
    const judge = await Judge.findOne({ slug })

    if (!judge) {
      throw new NotFoundError('Judge')
    }

    if (judge.shortlistSubmittedAt) {
      return { success: true, data: toJudgeItem(judge) }
    }

    if (judge.shortlist.length === 0) {
      throw new ForbiddenError('Vote for at least one work before submitting')
    }

    judge.shortlistSubmittedAt = new Date()
    await judge.save()

    revalidatePath(`/judge/${slug}`)
    revalidatePath('/admin/judging')
    revalidatePath('/admin/judging/combined-shortlist')

    return { success: true, data: toJudgeItem(judge) }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}
