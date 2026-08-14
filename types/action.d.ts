interface SignInWithOAuthParams {
  provider: 'github' | 'google'
  providerAccountId: string
  user: {
    email: string
    name: string
    image: string
    username: string
  }
}

interface AuthCredentials {
  name: string
  username: string
  email: string
  password: string
}

interface VerifyArtworkParams {
  ownerEmail: string
  status: import('@/lib/validations').ArtworkStatus
}

interface LikeArtworkParams {
  ownerEmail: string
}

interface AddArtworkNoteParams {
  artworkId: string
  text: string
}

interface UpdateArtworkNoteParams {
  artworkId: string
  noteIndex: number
  text: string
}

interface DeleteArtworkNoteParams {
  artworkId: string
  noteIndex: number
}

interface UpdateArtworkStatusParams {
  artworkId: string
  status: import('@/lib/validations').ArtworkStatus
}

interface UpdateArtworkDetailsParams {
  artworkId: string
  name: string
  email: string
  state: string
  title: string
  medium: string
  artworkSize: string
  venue: string
  dateCreated: Date
  artworkImage: string
  proveImage: string
}

interface RequestPublicVoteParams {
  artworkId: string
  email: string
}

interface ConfirmPublicVoteParams {
  token: string
}

interface ConfirmArtworkSubmissionParams {
  token: string
}

interface GetArtworksParams {
  page?: number
  pageSize?: number
  query?: string
  status?: import('@/lib/validations').ArtworkStatus[]
  regions?: string[]
  mediums?: string[]
  dateFrom?: Date
  dateTo?: Date
}

interface UpdateCompetitionDateParams {
  id: string
  date: Date
}

interface SubmitArtworkParams {
  name: string
  email: string
  state: string
  title: string
  medium: string
  artworkSize: string
  venue: string
  dateCreated: Date
  artworkImage: string
  proveImage: string
  agreedToRules: boolean
}
