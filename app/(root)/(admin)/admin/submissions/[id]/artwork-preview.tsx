'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Download,
  ExternalLink,
  Lock,
  Maximize2,
  MoreHorizontal,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useState } from 'react'

import { useEscapeToClose } from '@/hooks/use-escape-to-close'

type ArtworkPreviewProps = {
  title: string
  artworkImage: string
  proveImage: string
}

const MIN_ZOOM = 50
const MAX_ZOOM = 200
const ZOOM_STEP = 25

export default function ArtworkPreview({ title, artworkImage, proveImage }: ArtworkPreviewProps) {
  const [activeTab, setActiveTab] = useState<'artwork' | 'proof'>('artwork')
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const activeSrc = activeTab === 'artwork' ? artworkImage : proveImage

  useEscapeToClose(isFullscreen, setIsFullscreen)

  const handleTabChange = (tab: 'artwork' | 'proof') => {
    setActiveTab(tab)
    setZoom(100)
    setRotation(0)
  }

  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-zinc-200">
        <h3 className="font-bold text-zinc-900">Artwork Preview</h3>
        <div className="flex items-center gap-2">
          <a
            href={activeSrc}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 bg-white hover:bg-zinc-50"
          >
            <span className="hidden sm:inline">Open in new tab</span>
            <ExternalLink size={14} />
          </a>
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger className="cursor-pointer flex items-center justify-center rounded-lg border border-zinc-200 p-2 text-zinc-700 hover:bg-zinc-50">
              <MoreHorizontal size={16} />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-1.5">
              <a
                href={activeSrc}
                download
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
                onClick={() => setMenuOpen(false)}
              >
                <Download size={14} />
                Download image
              </a>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex items-center justify-center min-h-[240px] sm:min-h-[360px] overflow-hidden p-4 sm:p-6">
        <img
          src={activeSrc}
          alt={title}
          className="max-h-[240px] sm:max-h-[360px] max-w-full object-contain transition-transform duration-150"
          style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}
        />
      </div>
      <div className="flex items-center justify-center gap-3 py-3 border-b border-zinc-200">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
          disabled={zoom <= MIN_ZOOM}
          aria-label="Zoom out"
          className="text-zinc-500 hover:text-zinc-900 disabled:opacity-40 disabled:hover:text-zinc-500"
        >
          <ZoomOut size={18} className="cursor-pointer" />
        </button>
        <span className="w-12 text-center text-sm text-zinc-700">{zoom}%</span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
          disabled={zoom >= MAX_ZOOM}
          aria-label="Zoom in"
          className="text-zinc-500 hover:text-zinc-900 disabled:opacity-40 disabled:hover:text-zinc-500"
        >
          <ZoomIn size={18} className="cursor-pointer" />
        </button>
        <span className="h-4 w-px bg-zinc-200" />
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          aria-label="Expand"
          className="text-zinc-500 hover:text-zinc-900"
        >
          <Maximize2 size={18} className="cursor-pointer" />
        </button>
        <button
          type="button"
          onClick={() => setRotation((r) => (r + 90) % 360)}
          aria-label="Rotate"
          className="text-zinc-500 hover:text-zinc-900"
        >
          <RotateCw size={18} className="cursor-pointer" />
        </button>
      </div>
      <div className="flex border-b border-zinc-200">
        <button
          type="button"
          onClick={() => handleTabChange('artwork')}
          className={`cursor-pointer flex-1 px-4 py-2.5 text-sm text-center border-b-2 -mb-px transition-colors ${activeTab === 'artwork'
            ? 'border-zinc-900 font-semibold text-zinc-900'
            : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
        >
          Artwork preview
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('proof')}
          className={`cursor-pointer flex-1 px-4 py-2.5 text-sm text-center border-b-2 -mb-px transition-colors ${activeTab === 'proof'
            ? 'border-zinc-900 font-semibold text-zinc-900'
            : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
        >
          Proof photo
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4">
        <button
          type="button"
          onClick={() => handleTabChange('artwork')}
          className={`aspect-square w-full rounded-lg overflow-hidden border-2 ${activeTab === 'artwork' ? 'border-zinc-900' : 'border-transparent'
            }`}
        >
          <img
            src={artworkImage}
            alt={`${title} artwork preview`}
            className="size-full object-cover bg-zinc-100"
          />
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('proof')}
          className={`aspect-square w-full rounded-lg overflow-hidden border-2 ${activeTab === 'proof' ? 'border-zinc-900' : 'border-transparent'
            }`}
        >
          <img
            src={proveImage}
            alt={`${title} proof photo`}
            className="size-full object-cover bg-zinc-100"
          />
        </button>
      </div>
      <p className="flex items-center gap-1.5 px-4 pb-4 text-xs text-zinc-500">
        <Lock size={12} />
        The proof photo is only visible to administrators and judges.
      </p>
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            aria-label="Close"
            className="absolute top-5 right-5 text-3xl leading-none text-white/80 hover:text-white"
          >
            <X size={28} />
          </button>
          <img
            src={activeSrc}
            alt={title}
            onClick={(event) => event.stopPropagation()}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}
    </div>
  )
}
