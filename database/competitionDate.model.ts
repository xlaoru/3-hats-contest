import { Document, model, models, Schema } from 'mongoose'

export interface ICompetitionDate {
  name: string
  date: Date
}

export interface ICompetitionDateDoc extends ICompetitionDate, Document {}

const CompetitionDateSchema = new Schema<ICompetitionDate>({
  name: { type: String, required: true },
  date: { type: Date, required: true },
})

const CompetitionDate =
  models.CompetitionDate || model<ICompetitionDate>('CompetitionDate', CompetitionDateSchema)

export default CompetitionDate
