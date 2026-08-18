import { Document, model, models, Schema, Types } from 'mongoose'

export interface IJudge {
  index: number
  slug: string
  name: string | null
  email: string | null
  shortlist: Types.ObjectId[]
  shortlistSubmittedAt: Date | null
}

export interface IJudgeDoc extends IJudge, Document {}

const JudgeSchema = new Schema<IJudge>(
  {
    index: { type: Number, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, default: null },
    email: { type: String, default: null },
    shortlist: { type: [{ type: Schema.Types.ObjectId, ref: 'Artwork' }], default: [] },
    shortlistSubmittedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

const Judge = models.Judge || model<IJudge>('Judge', JudgeSchema)

export default Judge
