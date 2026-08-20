'use server'

import mongoose from 'mongoose'
import { revalidatePath } from 'next/cache'

import Artwork from '@/database/artwork.model'
import Judge, { IJudgeDoc } from '@/database/judge.model'
import { IParticipantDoc } from '@/database/participant.model'
import { ActionResponse, ErrorResponse } from '@/types/global'
import action from '../handlers/action'
import handleError from '../handlers/error'
import { NotFoundError } from '../http-errors'
import dbConnect from '../mongoose'
import { ArtworkAward, ConfirmWinnersSchema } from '../validations'

export type CombinedShortlistItem = {
  artworkId: string
  title: string
  medium: string
  artworkSize: string
  artworkImage: string
  participantName: string
  participantState: string
  selectedBy: { index: number; label: string }[]
  award: ArtworkAward | null
}

export type CombinedShortlistGroup = {
  count: number
  items: CombinedShortlistItem[]
}

export type CombinedShortlistData = {
  ready: boolean
  groups: CombinedShortlistGroup[]
}

function judgeLabel(judge: IJudgeDoc): string {
  return judge.name?.trim() || `Judge ${judge.index}`
}

export async function getCombinedShortlist(): Promise<ActionResponse<CombinedShortlistData>> {
  try {
    await dbConnect()

    const judges = await Judge.find().sort({ index: 1 })
    const ready = judges.length === 3 && judges.every((judge) => judge.shortlistSubmittedAt)

    if (!ready) {
      return { success: true, data: { ready: false, groups: [] } }
    }

    const selectionsByArtwork = new Map<string, { index: number; label: string }[]>()

    for (const judge of judges) {
      for (const artworkId of judge.shortlist) {
        const key = artworkId.toString()
        const entries = selectionsByArtwork.get(key) ?? []
        entries.push({ index: judge.index, label: judgeLabel(judge) })
        selectionsByArtwork.set(key, entries)
      }
    }

    const artworkIds = Array.from(selectionsByArtwork.keys())

    const artworks = await Artwork.find({ _id: { $in: artworkIds } }).populate<{
      participant: IParticipantDoc
    }>('participant')

    const groupsByCount = new Map<number, CombinedShortlistItem[]>()

    for (const artwork of artworks) {
      const selectedBy = (selectionsByArtwork.get(artwork._id.toString()) ?? []).sort(
        (a, b) => a.index - b.index,
      )

      const item: CombinedShortlistItem = {
        artworkId: artwork._id.toString(),
        title: artwork.title,
        medium: artwork.medium,
        artworkSize: artwork.artworkSize,
        artworkImage: artwork.artworkImage,
        participantName: artwork.participant.name,
        participantState: artwork.participant.state,
        selectedBy,
        award: artwork.award ?? null,
      }

      const count = selectedBy.length
      const items = groupsByCount.get(count) ?? []
      items.push(item)
      groupsByCount.set(count, items)
    }

    const groups: CombinedShortlistGroup[] = Array.from(groupsByCount.entries())
      .sort(([a], [b]) => b - a)
      .map(([count, items]) => ({
        count,
        items: items.sort((a, b) => a.title.localeCompare(b.title)),
      }))

    return { success: true, data: { ready: true, groups } }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }
}

export async function confirmWinners(params: ConfirmWinnersParams): Promise<ActionResponse> {
  const validationResult = await action({ params, schema: ConfirmWinnersSchema, authorize: true })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const { first, second, third, highlyCommended, peoplesChoice } = validationResult.params!
  const winningIds = [first, second, third, peoplesChoice, ...highlyCommended]

  const session = await mongoose.startSession()

  session.startTransaction()

  try {
    const foundCount = await Artwork.countDocuments({ _id: { $in: winningIds } }).session(session)

    if (foundCount !== new Set(winningIds).size) {
      throw new NotFoundError('One or more selected artworks')
    }

    await Artwork.updateMany({ award: { $ne: null } }, { award: null }, { session })
    await Artwork.findByIdAndUpdate(first, { award: 'first' }, { session })
    await Artwork.findByIdAndUpdate(second, { award: 'second' }, { session })
    await Artwork.findByIdAndUpdate(third, { award: 'third' }, { session })
    await Artwork.findByIdAndUpdate(peoplesChoice, { award: 'people_choice' }, { session })
    await Artwork.updateMany(
      { _id: { $in: highlyCommended } },
      { award: 'highly_commended' },
      { session },
    )

    await session.commitTransaction()

    revalidatePath('/admin/judging/combined-shortlist')
    revalidatePath('/admin/winners')

    return { success: true }
  } catch (error) {
    await session.abortTransaction()
    return handleError(error) as ErrorResponse
  } finally {
    await session.endSession()
  }
}
