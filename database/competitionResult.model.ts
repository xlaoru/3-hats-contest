import { model, models, Schema } from 'mongoose'

export interface ICompetitionResult {
  locked: boolean
  lockedAt: Date | null
}

const CompetitionResultSchema = new Schema<ICompetitionResult>(
  {
    locked: { type: Boolean, required: true, default: false },
    lockedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

const CompetitionResult =
  models.CompetitionResult || model<ICompetitionResult>('CompetitionResult', CompetitionResultSchema)

export default CompetitionResult
