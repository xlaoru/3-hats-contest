import Link from 'next/link'

type StateCardProps = {
  title: string
  backHref: string
  backLabel: string
  children: React.ReactNode
}

const StateCard = ({ title, backHref, backLabel, children }: StateCardProps) => (
  <div className="min-h-screen bg-gray-100 px-6 py-10 flex items-center justify-center">
    <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
      <h1 className="text-xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-sm text-gray-600">{children}</p>
      <Link
        href={backHref}
        className="inline-block mt-6 text-sm font-semibold text-blue-600 hover:text-blue-700"
      >
        ← {backLabel}
      </Link>
    </div>
  </div>
)

export default StateCard
