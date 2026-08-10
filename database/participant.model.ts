import { Document, model, models, Schema } from 'mongoose'

export interface IParticipant {
  name: string
  email: string
  state: string
  emailVerifiedAt: Date | null
  verificationTokenHash: string | null
  verificationTokenExpiresAt: Date | null
}

export interface IParticipantDoc extends IParticipant, Document {}

const ParticipantSchema = new Schema<IParticipant>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    state: { type: String, required: true },
    emailVerifiedAt: { type: Date, default: null },
    verificationTokenHash: { type: String, default: null },
    verificationTokenExpiresAt: { type: Date, default: null },
  },
  { timestamps: true },
)

ParticipantSchema.index({ verificationTokenHash: 1 })

const Participant = models.Participant || model<IParticipant>('Participant', ParticipantSchema)

export default Participant
