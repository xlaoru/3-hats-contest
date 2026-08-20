'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import Artwork, { IArtworkDoc } from '@/database/artwork.model'
import CompetitionResult from '@/database/competitionResult.model'
import Judge from '@/database/judge.model'
import { IParticipantDoc } from '@/database/participant.model'
import { JUDGE_COUNT } from '@/lib/judge-constants'
import { ActionResponse, ErrorResponse } from '@/types/global'
import handleError from '../handlers/error'
import { RequestError, UnauthorizedError } from '../http-errors'
import dbConnect from '../mongoose'
import { ArtworkAward } from '../validations'

export type WinnerItem = {
  artworkId: string
  title: string
  medium: string
  artworkSize: string
  artworkImage: string
  participantName: string
}

export type WinnersData = {
  shortlistReady: boolean
  winnersAssigned: boolean
  locked: boolean
  first: WinnerItem | null
  second: WinnerItem | null
  third: WinnerItem | null
  highlyCommended: WinnerItem[]
  peoplesChoice: WinnerItem | null
}

type PopulatedArtwork = IArtworkDoc & { participant: IParticipantDoc }

function toWinnerItem(artwork: PopulatedArtwork): WinnerItem {
  return {
    artworkId: artwork._id.toString(),
    title: artwork.title,
    medium: artwork.medium,
    artworkSize: artwork.artworkSize,
    artworkImage: artwork.artworkImage,
    participantName: artwork.participant.name,
  }
}

export async function getWinners(): Promise<ActionResponse<WinnersData>> {
  try {
    await dbConnect()

    const [judges, awardedArtworks, result] = await Promise.all([
      Judge.find(),
      Artwork.find({
        award: { $in: ['first', 'second', 'third', 'highly_commended', 'people_choice'] },
      }).populate<{ participant: IParticipantDoc }>('participant') as unknown as Promise<
        PopulatedArtwork[]
      >,
      CompetitionResult.findOne(),
    ])

    const shortlistReady =
      judges.length === JUDGE_COUNT && judges.every((judge) => judge.shortlistSubmittedAt)

    const byAward = (award: ArtworkAward) =>
      awardedArtworks.filter((artwork) => artwork.award === award)

    const first = byAward('first')[0] ? toWinnerItem(byAward('first')[0]) : null
    const second = byAward('second')[0] ? toWinnerItem(byAward('second')[0]) : null
    const third = byAward('third')[0] ? toWinnerItem(byAward('third')[0]) : null
    const peoplesChoice = byAward('people_choice')[0]
      ? toWinnerItem(byAward('people_choice')[0])
      : null
    const highlyCommended = byAward('highly_commended').map(toWinnerItem)

    const winnersAssigned = Boolean(first && second && third)

    return {
      success: true,
      data: {
        shortlistReady,
        winnersAssigned,
        locked: result?.locked ?? false,
        first,
        second,
        third,
        highlyCommended,
        peoplesChoice,
      },
    }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export async function lockWinners(): Promise<ActionResponse> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }

    await dbConnect()

    const [firstCount, secondCount, thirdCount] = await Promise.all([
      Artwork.countDocuments({ award: 'first' }),
      Artwork.countDocuments({ award: 'second' }),
      Artwork.countDocuments({ award: 'third' }),
    ])

    if (!firstCount || !secondCount || !thirdCount) {
      throw new RequestError(400, 'Select all winners before confirming and locking results')
    }

    await CompetitionResult.findOneAndUpdate(
      {},
      { locked: true, lockedAt: new Date() },
      { upsert: true },
    )

    revalidatePath('/admin/winners')

    return { success: true }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}
