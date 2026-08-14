'use client'

import { CompetitionDateItem, updateCompetitionDate } from '@/lib/actions/competitionDate.action'
import { Clock, PencilLine, PenOff, Target } from 'lucide-react'
import { useState, useTransition } from 'react'

type CompetitionTimelineProps = {
  dates: CompetitionDateItem[]
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const monthDayFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

function formatDate(value: string | Date): string {
  return dateFormatter.format(new Date(value))
}

function toInputValue(value: string | Date): string {
  return new Date(value).toISOString().slice(0, 10)
}

const valueTextClass = 'text-right text-sm text-zinc-900 whitespace-nowrap shrink-0'

const valueButtonClass = `${valueTextClass} hover:underline decoration-dotted underline-offset-4`

const editInputClass =
  'text-right text-sm border border-zinc-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-zinc-400 disabled:opacity-50'

type EditableDateProps = {
  id: string
  value: string | Date
  editable: boolean
  onSaved: (id: string, date: string) => void
}

function EditableDate({ id, value, editable, onSaved }: EditableDateProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleChange = (raw: string) => {
    if (!raw) return

    const nextDate = new Date(raw)

    startTransition(async () => {
      const result = await updateCompetitionDate({ id, date: nextDate })

      if (result.success && result.data) {
        setError(null)
        setIsEditing(false)
        onSaved(id, result.data.date as unknown as string)
      } else {
        setError(result.error?.message ?? "Couldn't save, please try again")
      }
    })
  }

  if (editable && isEditing) {
    return (
      <span className="flex flex-col items-end gap-1">
        <input
          type="date"
          autoFocus
          disabled={isPending}
          defaultValue={toInputValue(value)}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => setIsEditing(false)}
          className={editInputClass}
        />
        {error && <span className="text-xs text-red-600">{error}</span>}
      </span>
    )
  }

  if (!editable) {
    return <span className={valueTextClass}>{formatDate(value)}</span>
  }

  return (
    <button type="button" onClick={() => setIsEditing(true)} className={valueButtonClass}>
      {formatDate(value)}
    </button>
  )
}

type EditableDateRangeProps = {
  startId: string
  endId: string
  startValue: string | Date
  endValue: string | Date
  editable: boolean
  onSaved: (id: string, date: string) => void
}

function EditableDateRange({
  startId,
  endId,
  startValue,
  endValue,
  editable,
  onSaved,
}: EditableDateRangeProps) {
  const [isEditing, setIsEditing] = useState(false)

  if (editable && isEditing) {
    return (
      <span className="flex flex-col items-end gap-1">
        <EditableDate id={startId} value={startValue} editable onSaved={onSaved} />
        <EditableDate id={endId} value={endValue} editable onSaved={onSaved} />
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="text-xs text-zinc-400 hover:text-zinc-600"
        >
          Done
        </button>
      </span>
    )
  }

  const start = new Date(startValue)
  const end = new Date(endValue)
  const startLabel =
    start.getFullYear() === end.getFullYear() ? monthDayFormatter.format(start) : formatDate(start)
  const rangeText = `${startLabel} - ${formatDate(end)}`

  if (!editable) {
    return <span className={valueTextClass}>{rangeText}</span>
  }

  return (
    <button type="button" onClick={() => setIsEditing(true)} className={valueButtonClass}>
      {rangeText}
    </button>
  )
}

type TimelineRowProps = {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
  stacked?: boolean
}

function TimelineRow({ icon, label, children, stacked }: TimelineRowProps) {
  const labelEl = (
    <p className="flex items-center gap-2.5 text-sm text-zinc-700 shrink-0">
      <span className="flex items-center justify-center size-6 text-zinc-500 shrink-0">{icon}</span>
      {label}
    </p>
  )

  if (stacked) {
    return (
      <li className="flex flex-col gap-1 py-3 border-b border-zinc-100 last:border-b-0">
        {labelEl}
        <div className="pl-[34px]">{children}</div>
      </li>
    )
  }

  return (
    <li className="flex items-start justify-between gap-3 py-3 border-b border-zinc-100 last:border-b-0">
      {labelEl}
      {children}
    </li>
  )
}

export default function CompetitionTimeline({ dates }: CompetitionTimelineProps) {
  const [values, setValues] = useState(
    () => new Map(dates.map((item) => [item._id, item.date as string | Date])),
  )
  const [isEditMode, setIsEditMode] = useState(false)

  const handleSaved = (id: string, date: string) => {
    setValues((prev) => new Map(prev).set(id, date))
  }

  const byName = (name: string) => dates.find((item) => item.name === name)

  const entriesOpen = byName('Entries open')
  const entriesClose = byName('Entries close')
  const votingStart = byName("People's Choice voting start")
  const votingEnd = byName("People's Choice voting end")
  const winnersAnnounced = byName('Winners announced')

  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 px-6 py-4">
        <div className="flex w-full items-center justify-between">
          <h3 className="text-md font-bold text-zinc-900">Competition timeline</h3>
          <button
            type="button"
            onClick={() => setIsEditMode((prev) => !prev)}
            aria-pressed={isEditMode}
            aria-label={isEditMode ? 'Stop editing dates' : 'Edit dates'}
            className={`rounded p-1 transition-colors text-zinc-900`}
          >
            {isEditMode ? <PenOff size={16} className='cursor-pointer' /> : <PencilLine size={16} className='cursor-pointer' />}
          </button>
        </div>
        <ul className="flex flex-col">
          {entriesOpen && (
            <TimelineRow icon={<Clock size={12} />} label="Entries open">
              <EditableDate
                id={entriesOpen._id}
                value={values.get(entriesOpen._id) ?? entriesOpen.date}
                editable={isEditMode}
                onSaved={handleSaved}
              />
            </TimelineRow>
          )}
          {entriesClose && (
            <TimelineRow icon={<Clock size={12} />} label="Entries close">
              <EditableDate
                id={entriesClose._id}
                value={values.get(entriesClose._id) ?? entriesClose.date}
                editable={isEditMode}
                onSaved={handleSaved}
              />
            </TimelineRow>
          )}
          {votingStart && votingEnd && (
            <TimelineRow icon={<Target size={12} />} label="People's Choice voting" stacked>
              <EditableDateRange
                startId={votingStart._id}
                endId={votingEnd._id}
                startValue={values.get(votingStart._id) ?? votingStart.date}
                endValue={values.get(votingEnd._id) ?? votingEnd.date}
                editable={isEditMode}
                onSaved={handleSaved}
              />
            </TimelineRow>
          )}
          {winnersAnnounced && (
            <TimelineRow icon={<Clock size={12} />} label="Winners announced">
              <EditableDate
                id={winnersAnnounced._id}
                value={values.get(winnersAnnounced._id) ?? winnersAnnounced.date}
                editable={isEditMode}
                onSaved={handleSaved}
              />
            </TimelineRow>
          )}
        </ul>
      </div>
    </div>
  )
}
