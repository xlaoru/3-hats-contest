'use client'

import { updateJudgeField, type JudgeItem } from '@/lib/actions/judge.action'
import { JUDGE_SHORTLIST_CAP } from '@/lib/judge-constants'
import { cn } from '@/lib/utils'
import { Check, CircleCheck, Copy, ExternalLink, Info, MoreHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'

export type JudgeRow = JudgeItem & { link: string }

type JudgesTableProps = {
  judges: JudgeRow[]
  allSubmitted: boolean
}

function getInitials(name: string | null, index: number): string {
  const trimmed = name?.trim()

  if (!trimmed) return `J${index}`

  const parts = trimmed.split(/\s+/).filter(Boolean)

  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function judgeStatus(judge: JudgeRow): { label: string; className: string; complete?: boolean } {
  if (judge.shortlistSubmittedAt) {
    return { label: 'Shortlist complete', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', complete: true }
  }
  if (judge.shortlistCount > 0) {
    return { label: 'In progress', className: 'bg-amber-50 text-amber-700 border-amber-200' }
  }
  return { label: 'Not started', className: 'bg-zinc-100 text-zinc-600 border-zinc-200' }
}

function CopyButton({
  value,
  label = 'Copy',
  className,
}: {
  value: string
  label?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — user can still select the text manually.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50',
        className,
      )}
    >
      {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
      {copied ? 'Copied' : label}
    </button>
  )
}

function InlineEditableField({
  judgeId,
  field,
  value,
  emptyLabel,
  inputPlaceholder,
  textClassName,
  copyable,
}: {
  judgeId: string
  field: 'name' | 'email'
  value: string | null
  emptyLabel: string
  inputPlaceholder: string
  textClassName: string
  copyable?: boolean
}) {
  const router = useRouter()
  const current = value ?? ''
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(current)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const skipBlurSaveRef = useRef(false)

  const startEditing = () => {
    setDraft(current)
    setError(null)
    setEditing(true)
  }

  const cancelEditing = () => {
    skipBlurSaveRef.current = true
    setEditing(false)
    setError(null)
  }

  const save = () => {
    const trimmed = draft.trim()

    if (trimmed === current) {
      setEditing(false)
      return
    }

    startTransition(async () => {
      const result = await updateJudgeField({ judgeId, field, value: trimmed })

      if (result.success) {
        setEditing(false)
        router.refresh()
      } else {
        setError(result.error?.message ?? "Couldn't save, please try again")
      }
    })
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-1">
        <input
          autoFocus
          value={draft}
          disabled={isPending}
          placeholder={inputPlaceholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              ;(e.target as HTMLInputElement).blur()
            }
            if (e.key === 'Escape') {
              e.preventDefault()
              cancelEditing()
            }
          }}
          onBlur={() => {
            if (skipBlurSaveRef.current) {
              skipBlurSaveRef.current = false
              return
            }
            save()
          }}
          className="w-full min-w-0 rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  }

  if (!current) {
    return (
      <button
        type="button"
        onClick={startEditing}
        className="inline-flex w-fit cursor-pointer items-center rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
      >
        {emptyLabel}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <span className={cn('truncate', textClassName)}>{current}</span>
      <button
        type="button"
        onClick={startEditing}
        aria-label={`Edit ${field}`}
        className="shrink-0 cursor-pointer rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
      >
        <MoreHorizontal className="size-3.5" />
      </button>
      {copyable && (
        <CopyButton
          value={current}
          label=""
          className="border-0 bg-transparent px-0.5 py-0.5 hover:bg-zinc-100"
        />
      )}
    </div>
  )
}

export default function JudgesTable({ judges, allSubmitted }: JudgesTableProps) {
  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-6 py-5">
        <h2 className="text-lg font-bold text-zinc-900">Judges</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="text-xs font-medium text-zinc-500">
              <th className="px-6 py-3 font-medium">Judge</th>
              <th className="px-6 py-3 font-medium">Judging link</th>
              <th className="px-6 py-3 font-medium">Shortlist progress</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {judges.map((judge) => {
              const status = judgeStatus(judge)
              const percent = Math.min(
                100,
                Math.round((judge.shortlistCount / JUDGE_SHORTLIST_CAP) * 100),
              )

              return (
                <tr key={judge._id} className="border-t border-zinc-100 align-top">
                  <td className="px-6 py-5">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700">
                        {getInitials(judge.name, judge.index)}
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <p className="text-sm font-semibold text-zinc-900">Judge {judge.index}</p>
                        <InlineEditableField
                          judgeId={judge._id}
                          field="name"
                          value={judge.name}
                          emptyLabel="Add name"
                          inputPlaceholder="Full name"
                          textClassName="text-sm text-zinc-700"
                        />
                        <InlineEditableField
                          judgeId={judge._id}
                          field="email"
                          value={judge.email}
                          emptyLabel="Add email"
                          inputPlaceholder="name@example.com"
                          textClassName="text-sm text-zinc-500"
                          copyable
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex max-w-xs items-center gap-2">
                      <input
                        readOnly
                        value={judge.link}
                        onFocus={(e) => e.currentTarget.select()}
                        className="w-full min-w-0 rounded-lg border border-zinc-300 bg-zinc-50 px-2.5 py-2 text-xs text-zinc-600 focus:outline-none"
                      />
                      <CopyButton value={judge.link} className="px-2.5 py-2" />
                    </div>
                    <a
                      href={judge.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700"
                    >
                      Open link <ExternalLink className="size-3" />
                    </a>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <p className="text-sm font-semibold text-zinc-900">
                        {judge.shortlistCount} / {JUDGE_SHORTLIST_CAP}
                      </p>
                      <div className="h-1.5 w-full max-w-36 rounded-full bg-zinc-200">
                        <div
                          className={cn(
                            'h-1.5 rounded-full',
                            percent === 100 ? 'bg-emerald-600' : 'bg-zinc-900',
                          )}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="text-xs text-zinc-500">
                        {judge.shortlistCount === 0 ? 'No works added yet' : `${percent}% complete`}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
                        status.className,
                      )}
                    >
                      {status.complete && <CircleCheck className="size-3.5" />}
                      {status.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-start gap-3 border-t border-zinc-100 bg-blue-50/60 px-6 py-5">
        <Info className="mt-0.5 size-5 shrink-0 text-blue-500" />
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-semibold text-zinc-900">What happens next?</p>
          <p className="text-sm text-zinc-600">
            {allSubmitted
              ? 'Review the combined shortlist created from all judges. You can see how many judges selected each work and choose the winners.'
              : 'When all judges have finished their shortlists, you can combine them to create the shortlist for final judging.'}
          </p>
        </div>
      </div>
    </div>
  )
}
