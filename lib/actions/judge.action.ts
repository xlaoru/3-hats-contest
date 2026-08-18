'use server'

import { randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'

import Judge, { IJudgeDoc } from '@/database/judge.model'
import { JUDGE_COUNT } from '@/lib/judge-constants'
import { ActionResponse, ErrorResponse } from '@/types/global'
import action from '../handlers/action'
import handleError from '../handlers/error'
import { NotFoundError } from '../http-errors'
import dbConnect from '../mongoose'
import { UpdateJudgeFieldSchema } from '../validations'

export type JudgeItem = {
  _id: string
  index: number
  slug: string
  name: string | null
  email: string | null
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
