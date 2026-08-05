interface SignInWithOAuthParams {
  provider: "github" | "google";
  providerAccountId: string;
  user: {
    email: string;
    name: string;
    image: string;
    username: string;
  };
}

interface AuthCredentials {
  name: string;
  username: string;
  email: string;
  password: string;
}

interface VerifyArtworkParams {
  ownerEmail: string;
}

interface LikeArtworkParams {
  ownerEmail: string;
}

interface RequestPublicVoteParams {
  artworkId: string;
  email: string;
}

interface ConfirmPublicVoteParams {
  token: string;
}