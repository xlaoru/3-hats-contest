import { Document, model, models, Schema, Types } from 'mongoose'

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
  isVerified: boolean
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
    isVerified: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
)

const Artwork = models.Artwork || model<IArtwork>('Artwork', ArtworkSchema)

export default Artwork
