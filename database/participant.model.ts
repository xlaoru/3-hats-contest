import { Document, model, models, Schema } from 'mongoose'

export interface IParticipant {
  name: string
  email: string
  state: string
}

export interface IParticipantDoc extends IParticipant, Document {}

const ParticipantSchema = new Schema<IParticipant>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    state: { type: String, required: true },
  },
  { timestamps: true },
)

const Participant = models.Participant || model<IParticipant>('Participant', ParticipantSchema)

export default Participant
