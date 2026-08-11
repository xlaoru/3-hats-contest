import { signInWithGithub, signInWithGoogle } from '@/lib/actions/auth.action'

const oauthButtonClass =
  'w-full text-black border border-black bg-none hover:bg-gray-200 py-2.5 rounded-lg transition-colors'

const OAuthButtons = () => (
  <div className="grid grid-cols-2 gap-3 mt-6">
    <form action={signInWithGithub}>
      <button type="submit" className={oauthButtonClass}>
        Login with GitHub
      </button>
    </form>
    <form action={signInWithGoogle}>
      <button type="submit" className={oauthButtonClass}>
        Login with Google
      </button>
    </form>
  </div>
)

export default OAuthButtons
