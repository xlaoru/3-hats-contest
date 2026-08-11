import { model, models, Schema, Types } from 'mongoose'

export interface IJudgeVote {
  judge: Types.ObjectId
  artwork: Types.ObjectId
}

const JudgeVoteSchema = new Schema<IJudgeVote>(
  {
    judge: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    artwork: { type: Schema.Types.ObjectId, ref: 'Artwork', required: true },
  },
  { timestamps: true },
)

JudgeVoteSchema.index({ judge: 1, artwork: 1 }, { unique: true })

const JudgeVote = models.JudgeVote || model<IJudgeVote>('JudgeVote', JudgeVoteSchema)

export default JudgeVote
