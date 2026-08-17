'use client'

import { Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { updateArtworkDetails } from '@/lib/actions/artwork.action'

type EditArtworkModalProps = {
  artworkId: string
  name: string
  email: string
  state: string
  title: string
  medium: string
  artworkSize: string
  venue: string
  dateCreated: string | Date
  artworkImage: string
  proveImage: string
}

type FormState = {
  name: string
  email: string
  state: string
  title: string
  medium: string
  artworkSize: string
  venue: string
  dateCreated: string
  artworkImage: string
  proveImage: string
}

const inputClass =
  'w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400'

const labelClass = 'block text-sm text-zinc-500 mb-1'

function toDateInputValue(value: string | Date): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function toFormState(props: EditArtworkModalProps): FormState {
  return {
    name: props.name,
    email: props.email,
    state: props.state,
    title: props.title,
    medium: props.medium,
    artworkSize: props.artworkSize,
    venue: props.venue,
    dateCreated: toDateInputValue(props.dateCreated),
    artworkImage: props.artworkImage,
    proveImage: props.proveImage,
  }
}

export default function EditArtworkModal(props: EditArtworkModalProps) {
  const { artworkId } = props
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(() => toFormState(props))
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setForm(toFormState(props))
      setError(null)
    }
    setOpen(nextOpen)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    startTransition(async () => {
      const result = await updateArtworkDetails({
        artworkId,
        ...form,
        dateCreated: new Date(form.dateCreated),
      })

      if (result.success) {
        setError(null)
        setOpen(false)
        router.refresh()
      } else {
        setError(result.error?.message ?? "Couldn't save changes, please try again")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 bg-white hover:bg-zinc-50">
        <Pencil size={14} />
        Edit
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit submission details</DialogTitle>
          <DialogDescription>Update the information below. Changes are saved to the submission.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <div className="col-span-2 grid grid-cols-2 gap-x-6">
              <h3 className="text-sm font-bold text-zinc-900">Applicant details</h3>
              <h3 className="text-sm font-bold text-zinc-900">Artwork details</h3>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className={labelClass}>Artist name</label>
                <input
                  className={inputClass}
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  className={inputClass}
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input
                  className={inputClass}
                  type="text"
                  required
                  value={form.state}
                  onChange={(e) => update('state', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Life drawing session venue</label>
                <input
                  className={inputClass}
                  type="text"
                  required
                  value={form.venue}
                  onChange={(e) => update('venue', e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className={labelClass}>Artwork title</label>
                <input
                  className={inputClass}
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Medium</label>
                <input
                  className={inputClass}
                  type="text"
                  required
                  value={form.medium}
                  onChange={(e) => update('medium', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Dimensions</label>
                <input
                  className={inputClass}
                  type="text"
                  required
                  placeholder="e.g. 50 x 70 cm"
                  value={form.artworkSize}
                  onChange={(e) => update('artworkSize', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Date of work</label>
                <input
                  className={inputClass}
                  type="date"
                  required
                  value={form.dateCreated}
                  onChange={(e) => update('dateCreated', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-zinc-900 mb-2">Images</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Artwork image URL</label>
                <input
                  className={inputClass}
                  type="url"
                  required
                  placeholder="https://…"
                  value={form.artworkImage}
                  onChange={(e) => update('artworkImage', e.target.value)}
                />
                {form.artworkImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.artworkImage}
                    alt="Artwork preview"
                    className="mt-2 h-24 w-24 object-cover rounded-lg border border-zinc-200 bg-zinc-100"
                  />
                )}
              </div>
              <div>
                <label className={labelClass}>Proof photo URL</label>
                <input
                  className={inputClass}
                  type="url"
                  required
                  placeholder="https://…"
                  value={form.proveImage}
                  onChange={(e) => update('proveImage', e.target.value)}
                />
                {form.proveImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.proveImage}
                    alt="Proof preview"
                    className="mt-2 h-24 w-24 object-cover rounded-lg border border-zinc-200 bg-zinc-100"
                  />
                )}
                <p className="text-xs text-zinc-400 mt-1">
                  Only visible to administrators and judges.
                </p>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter className="pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="cursor-pointer rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save changes'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
