import { model, models, Schema, Types } from 'mongoose'

export interface IPublicVote {
  email: string
  artwork: Types.ObjectId
  tokenHash: string | null
  expiresAt: Date | null
  verifiedAt: Date | null
  updatedAt: Date
}

const PublicVoteSchema = new Schema<IPublicVote>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    artwork: { type: Schema.Types.ObjectId, ref: 'Artwork', required: true },
    tokenHash: { type: String, default: null },
    expiresAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

PublicVoteSchema.index({ tokenHash: 1 })

const PublicVote = models.PublicVote || model<IPublicVote>('PublicVote', PublicVoteSchema)

export default PublicVote
