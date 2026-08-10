import { Document, model, models, Schema, Types } from 'mongoose'

import { ArtworkStatusEnum, type ArtworkStatus } from '@/lib/validations'

export interface IArtwork {
  participant: Types.ObjectId
  title: string
  medium: string
  artworkSize: string
  venue: string
  dateCreated: Date
  artworkImage: string
  proveImage: string
  agreedToRules: boolean
  status: ArtworkStatus
  createdAt?: Date
  updatedAt?: Date
}

export interface IArtworkDoc extends IArtwork, Document {}

const ArtworkSchema = new Schema<IArtwork>(
  {
    participant: { type: Schema.Types.ObjectId, ref: 'Participant', required: true },
    title: { type: String, required: true },
    medium: { type: String, required: true },
    artworkSize: { type: String, required: true },
    venue: { type: String, required: true },
    dateCreated: { type: Date, required: true },
    artworkImage: { type: String, required: true },
    proveImage: { type: String, required: true },
    agreedToRules: { type: Boolean, required: true, default: false },
    status: {
      type: String,
      enum: ArtworkStatusEnum.options,
      required: true,
      default: 'pending',
    },
  },
  { timestamps: true },
)

const Artwork = models.Artwork || model<IArtwork>('Artwork', ArtworkSchema)

export default Artwork
