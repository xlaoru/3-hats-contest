'use server'

import CompetitionDate, { ICompetitionDate } from '@/database/competitionDate.model'
import { ActionResponse, ErrorResponse } from '@/types/global'
import { revalidatePath } from 'next/cache'
import action from '../handlers/action'
import handleError from '../handlers/error'
import { NotFoundError } from '../http-errors'
import dbConnect from '../mongoose'
import { UpdateCompetitionDateSchema } from '../validations'

export type CompetitionDateItem = ICompetitionDate & { _id: string }

export async function getCompetitionDates(): Promise<ActionResponse<CompetitionDateItem[]>> {
  try {
    await dbConnect()

    const dates = await CompetitionDate.find().sort({ date: 1 })

    return { success: true, data: JSON.parse(JSON.stringify(dates)) }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export async function updateCompetitionDate(
  params: UpdateCompetitionDateParams,
): Promise<ActionResponse<CompetitionDateItem>> {
  const validationResult = await action({
    params,
    schema: UpdateCompetitionDateSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { id, date } = validationResult.params!

  try {
    const competitionDate = await CompetitionDate.findById(id)

    if (!competitionDate) {
      throw new NotFoundError('Competition date')
    }

    competitionDate.date = date
    await competitionDate.save()

    revalidatePath('/admin/submissions')

    return { success: true, data: JSON.parse(JSON.stringify(competitionDate)) }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}
