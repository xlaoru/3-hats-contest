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
