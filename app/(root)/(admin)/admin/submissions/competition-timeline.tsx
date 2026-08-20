'use client'

import { CompetitionDateItem } from '@/lib/actions/competitionDate.action'
import { Clock, PencilLine, Target } from 'lucide-react'
import Link from 'next/link'

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

const valueTextClass = 'text-right text-sm text-zinc-900 whitespace-nowrap shrink-0'

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
          <Link
            href="/admin/settings"
            aria-label="Edit dates in Settings"
            className="rounded p-1 transition-colors text-zinc-900"
          >
            <PencilLine size={16} className="cursor-pointer" />
          </Link>
        </div>
        <ul className="flex flex-col">
          {entriesOpen && (
            <TimelineRow icon={<Clock size={12} />} label="Entries open">
              <span className={valueTextClass}>{formatDate(entriesOpen.date)}</span>
            </TimelineRow>
          )}
          {entriesClose && (
            <TimelineRow icon={<Clock size={12} />} label="Entries close">
              <span className={valueTextClass}>{formatDate(entriesClose.date)}</span>
            </TimelineRow>
          )}
          {votingStart && votingEnd && (
            <TimelineRow icon={<Target size={12} />} label="People's Choice voting" stacked>
              <span className={valueTextClass}>
                {(() => {
                  const start = new Date(votingStart.date)
                  const end = new Date(votingEnd.date)
                  const startLabel =
                    start.getFullYear() === end.getFullYear()
                      ? monthDayFormatter.format(start)
                      : formatDate(start)
                  return `${startLabel} - ${formatDate(end)}`
                })()}
              </span>
            </TimelineRow>
          )}
          {winnersAnnounced && (
            <TimelineRow icon={<Clock size={12} />} label="Winners announced">
              <span className={valueTextClass}>{formatDate(winnersAnnounced.date)}</span>
            </TimelineRow>
          )}
        </ul>
      </div>
    </div>
  )
}
