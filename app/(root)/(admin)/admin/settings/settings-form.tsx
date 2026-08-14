'use client'

import { Button } from '@/components/ui/button'
import { CompetitionDateItem, updateCompetitionDate } from '@/lib/actions/competitionDate.action'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { useMemo, useState, useTransition } from 'react'

type SettingsFormProps = {
  dates: CompetitionDateItem[]
}

type FieldName = 'entriesOpen' | 'entriesClose' | 'votingStart' | 'votingEnd' | 'winnersAnnounced'

type FieldConfig = {
  name: FieldName
  sourceName: string
  type: 'datetime-local' | 'date'
}

const fieldConfigs: FieldConfig[] = [
  { name: 'entriesOpen', sourceName: 'Entries open', type: 'datetime-local' },
  { name: 'entriesClose', sourceName: 'Entries close', type: 'datetime-local' },
  { name: 'votingStart', sourceName: "People's Choice voting start", type: 'date' },
  { name: 'votingEnd', sourceName: "People's Choice voting end", type: 'date' },
  { name: 'winnersAnnounced', sourceName: 'Winners announced', type: 'date' },
]

type FormValues = Record<FieldName, string>

function toInputValue(value: Date | string, type: 'datetime-local' | 'date'): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const iso = date.toISOString()
  return type === 'datetime-local' ? iso.slice(0, 16) : iso.slice(0, 10)
}

function buildInitialValues(dates: CompetitionDateItem[]): { ids: Partial<Record<FieldName, string>>; values: FormValues } {
  const ids: Partial<Record<FieldName, string>> = {}
  const values = {} as FormValues

  for (const field of fieldConfigs) {
    const item = dates.find((d) => d.name === field.sourceName)
    ids[field.name] = item?._id
    values[field.name] = item ? toInputValue(item.date, field.type) : ''
  }

  return { ids, values }
}

const rowClass = 'flex flex-col gap-3 py-5 first:pt-0 last:pb-0 border-b border-zinc-100 last:border-b-0 sm:flex-row sm:items-center sm:justify-between'

const inputClass =
  'w-full appearance-none rounded-lg border border-zinc-300 bg-white px-3 py-2 pr-9 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50'

function DateField({
  value,
  onChange,
  type,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  type: 'datetime-local' | 'date'
  disabled?: boolean
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
      <CalendarIcon
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
      />
    </div>
  )
}

export default function SettingsForm({ dates }: SettingsFormProps) {
  const initial = useMemo(() => buildInitialValues(dates), [dates])
  const [values, setValues] = useState<FormValues>(initial.values)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isDirty = fieldConfigs.some((field) => values[field.name] !== initial.values[field.name])

  const update = (name: FieldName, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleCancel = () => {
    setValues(initial.values)
    setError(null)
  }

  const handleSave = () => {
    setError(null)

    const changed = fieldConfigs.filter(
      (field) => values[field.name] && values[field.name] !== initial.values[field.name],
    )

    if (changed.length === 0) return

    startTransition(async () => {
      const results = await Promise.all(
        changed.map((field) => {
          const id = initial.ids[field.name]
          if (!id) return Promise.resolve({ success: true } as const)

          return updateCompetitionDate({ id, date: new Date(values[field.name]) })
        }),
      )

      const failed = results.find((result) => !result.success)

      if (failed && !failed.success) {
        setError(failed.error?.message ?? "Couldn't save changes, please try again")
      }
    })
  }

  return (
    <div className="w-full max-w-3xl rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-col px-6 py-2">
        <div className={rowClass}>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-zinc-900">Entries open</p>
            <p className="text-sm text-zinc-500">Date and time when entries can be submitted.</p>
          </div>
          <div className="w-full sm:w-64 shrink-0">
            <DateField
              type="datetime-local"
              value={values.entriesOpen}
              onChange={(v) => update('entriesOpen', v)}
              disabled={isPending}
            />
          </div>
        </div>

        <div className={rowClass}>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-zinc-900">Entries close</p>
            <p className="text-sm text-zinc-500">Deadline for submitting entries.</p>
          </div>
          <div className="w-full sm:w-64 shrink-0">
            <DateField
              type="datetime-local"
              value={values.entriesClose}
              onChange={(v) => update('entriesClose', v)}
              disabled={isPending}
            />
          </div>
        </div>

        <div className={rowClass}>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-zinc-900">People&apos;s Choice</p>
            <p className="text-sm text-zinc-500">Voting period for People&apos;s Choice award.</p>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-64 shrink-0">
            <DateField
              type="date"
              value={values.votingStart}
              onChange={(v) => update('votingStart', v)}
              disabled={isPending}
            />
            <span className="shrink-0 text-zinc-400">–</span>
            <DateField
              type="date"
              value={values.votingEnd}
              onChange={(v) => update('votingEnd', v)}
              disabled={isPending}
            />
          </div>
        </div>

        <div className={rowClass}>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-zinc-900">Results</p>
            <p className="text-sm text-zinc-500">Date when winners will be announced.</p>
          </div>
          <div className="w-full sm:w-64 shrink-0">
            <DateField
              type="date"
              value={values.winnersAnnounced}
              onChange={(v) => update('winnersAnnounced', v)}
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      <div className={cn('flex items-center justify-end gap-3 border-t border-zinc-100 px-6 py-4', error && 'justify-between')}>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending || !isDirty}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isPending || !isDirty}>
            {isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
