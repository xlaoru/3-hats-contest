import { auth } from '@/auth'
import { getCompetitionDates } from '@/lib/actions/competitionDate.action'
import { redirect } from 'next/navigation'
import SettingsForm from './settings-form'

const Settings = async () => {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/')
  }

  const { success, data } = await getCompetitionDates()
  const competitionDates = success && data ? data : []

  return (
    <div className="min-h-screen bg-zinc-100 px-6 py-10 flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-900">Competition Settings</h1>
        <p className="text-sm text-zinc-700">Manage key dates and the current status of your competition.</p>
      </div>

      <SettingsForm dates={competitionDates} />
    </div>
  )
}

export default Settings
