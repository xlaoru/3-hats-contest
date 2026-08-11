import { auth } from '@/auth'
import Link from 'next/link'

const Home = async () => {
  const session = await auth()

  return (
    <>
      <Link
        href="/artworks"
        className="w-fit inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors"
      >
        Artworks
      </Link>
      {session?.user?.id ? (
        <Link
          href="/admin/submissions"
          className="w-fit inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors"
        >
          Admin Panel
        </Link>
      ) : (
        <Link
          href="/sign-in"
          className="w-fit inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors"
        >
          Sign in
        </Link>
      )}
    </>
  )
}

export default Home
