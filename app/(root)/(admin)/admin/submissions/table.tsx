'use client'

import { Checkbox } from '@/components/ui/checkbox'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { ArtworkFilterOptions, PopulatedArtwork } from '@/lib/actions/artwork.action'
import { statusLabels, statusStyles } from '@/lib/artwork-status'
import { ArtworkStatusEnum, type ArtworkStatus } from '@/lib/validations'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const SEARCH_DEBOUNCE_MS = 400

const dateCreatedFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

function formatDateCreated(value: string | Date): string {
  return dateCreatedFormatter.format(new Date(value))
}

function getPageNumbers(current: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = [1]

  if (current > 3) pages.push('ellipsis')

  const start = Math.max(2, current - 1)
  const end = Math.min(totalPages - 1, current + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (current < totalPages - 2) pages.push('ellipsis')

  pages.push(totalPages)

  return pages
}

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

type SearchInputProps = {
  initialValue: string
  onDebouncedChange: (value: string) => void
}

function SearchInput({ initialValue, onDebouncedChange }: SearchInputProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => onDebouncedChange(value), SEARCH_DEBOUNCE_MS)
  }

  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
      <input
        type="text"
        defaultValue={initialValue}
        onChange={handleChange}
        placeholder="Search by name, title or reference..."
        className="w-full rounded-lg border border-zinc-200 py-2 pr-3 pl-9 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none"
      />
    </div>
  )
}

type FilterFormValues = {
  statuses: ArtworkStatus[]
  regions: string[]
  mediums: string[]
  dateFrom: string
  dateTo: string
}

type FilterFormProps = {
  options: ArtworkFilterOptions
  initial: FilterFormValues
  onApply: (values: FilterFormValues) => void
  onClear: () => void
}

function FilterForm({ options, initial, onApply, onClear }: FilterFormProps) {
  const [statuses, setStatuses] = useState<ArtworkStatus[]>(initial.statuses)
  const [regions, setRegions] = useState<string[]>(initial.regions)
  const [mediums, setMediums] = useState<string[]>(initial.mediums)
  const [dateFrom, setDateFrom] = useState(initial.dateFrom)
  const [dateTo, setDateTo] = useState(initial.dateTo)

  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-zinc-500">Status</p>
        <div className="flex flex-col gap-2">
          {ArtworkStatusEnum.options.map((status) => (
            <label key={status} className="flex items-center gap-2 text-sm text-zinc-700">
              <Checkbox
                checked={statuses.includes(status)}
                onCheckedChange={() => setStatuses((prev) => toggleValue(prev, status))}
              />
              {statusLabels[status]}
            </label>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-zinc-500">Upload time</p>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm text-zinc-700 focus:outline-none"
          />
          <span className="text-xs text-zinc-400">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm text-zinc-700 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-zinc-500">Region</p>
        <div className="flex max-h-40 flex-col gap-2 overflow-y-auto">
          {options.regions.length === 0 && (
            <p className="text-xs text-zinc-400">No submissions yet</p>
          )}
          {options.regions.map((region) => (
            <label key={region} className="flex items-center gap-2 text-sm text-zinc-700">
              <Checkbox
                checked={regions.includes(region)}
                onCheckedChange={() => setRegions((prev) => toggleValue(prev, region))}
              />
              {region}
            </label>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-zinc-500">Medium</p>
        <div className="flex max-h-40 flex-col gap-2 overflow-y-auto">
          {options.mediums.length === 0 && (
            <p className="text-xs text-zinc-400">No submissions yet</p>
          )}
          {options.mediums.map((medium) => (
            <label key={medium} className="flex items-center gap-2 text-sm text-zinc-700">
              <Checkbox
                checked={mediums.includes(medium)}
                onCheckedChange={() => setMediums((prev) => toggleValue(prev, medium))}
              />
              {medium}
            </label>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-zinc-200 pt-3">
        <button type="button" onClick={onClear} className="text-sm text-zinc-500">
          Clear all
        </button>
        <button
          type="button"
          onClick={() => onApply({ statuses, regions, mediums, dateFrom, dateTo })}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          Apply filters
        </button>
      </div>
    </>
  )
}

type TableProps = {
  artworks: PopulatedArtwork[]
  total: number
  isNext: boolean
  page: number
  pageSize: number
  filterOptions: ArtworkFilterOptions
}

export default function Table({
  artworks,
  total,
  isNext,
  page,
  pageSize,
  filterOptions,
}: TableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)
  const pageNumbers = getPageNumbers(page, totalPages)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchKey = searchParams.toString()

  const currentStatuses = (searchParams.get('status')?.split(',').filter(Boolean) ??
    []) as ArtworkStatus[]
  const currentRegions = searchParams.get('region')?.split(',').filter(Boolean) ?? []
  const currentMediums = searchParams.get('medium')?.split(',').filter(Boolean) ?? []
  const currentDateFrom = searchParams.get('dateFrom') ?? ''
  const currentDateTo = searchParams.get('dateTo') ?? ''
  const currentQuery = searchParams.get('query') ?? ''

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const allSelected =
    artworks.length > 0 && artworks.every((item) => selectedIds.includes(item._id))
  const someSelected = selectedIds.length > 0 && !allSelected

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : artworks.map((item) => item._id))
  }

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => toggleValue(prev, id))
  }

  function buildUrl(updates: Record<string, string | string[] | undefined>) {
    const params = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(updates)) {
      const isEmpty =
        value === undefined || value === '' || (Array.isArray(value) && value.length === 0)

      if (isEmpty) {
        params.delete(key)
      } else {
        params.set(key, Array.isArray(value) ? value.join(',') : value)
      }
    }

    const search = params.toString()
    return search ? `${pathname}?${search}` : pathname
  }

  const activeStatusTab: ArtworkStatus | 'all' =
    currentStatuses.length === 1 ? currentStatuses[0] : 'all'

  const statusTabs: { key: ArtworkStatus | 'all'; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: filterOptions.total },
    ...ArtworkStatusEnum.options.map((status) => ({
      key: status,
      label: statusLabels[status],
      count: filterOptions.statusCounts[status] ?? 0,
    })),
  ]

  const selectStatusTab = (key: ArtworkStatus | 'all') => {
    router.push(buildUrl({ status: key === 'all' ? undefined : [key], page: undefined }))
  }

  const applyFilters = (values: FilterFormValues) => {
    router.push(
      buildUrl({
        status: values.statuses,
        region: values.regions,
        medium: values.mediums,
        dateFrom: values.dateFrom || undefined,
        dateTo: values.dateTo || undefined,
        page: undefined,
      }),
    )
    setFiltersOpen(false)
  }

  const clearFilters = () => {
    router.push(
      buildUrl({
        status: undefined,
        region: undefined,
        medium: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        page: undefined,
      }),
    )
    setFiltersOpen(false)
  }

  const activeFilterCount =
    currentStatuses.length +
    currentRegions.length +
    currentMediums.length +
    (currentDateFrom ? 1 : 0) +
    (currentDateTo ? 1 : 0)

  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center gap-6 overflow-x-auto border-b border-zinc-200 px-6">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => selectStatusTab(tab.key)}
            className={`whitespace-nowrap border-b-2 py-4 text-sm transition-colors ${
              activeStatusTab === tab.key
                ? 'border-zinc-900 font-medium text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {tab.label} <span className="text-zinc-400">{tab.count}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <SearchInput
          initialValue={currentQuery}
          onDebouncedChange={(value) =>
            router.push(buildUrl({ query: value || undefined, page: undefined }))
          }
        />
        <div className="flex shrink-0 items-center gap-3">
          <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
            <PopoverTrigger className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700">
              <SlidersHorizontal className="size-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white">
                  {activeFilterCount}
                </span>
              )}
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 gap-4 p-4">
              <FilterForm
                key={searchKey}
                options={filterOptions}
                initial={{
                  statuses: currentStatuses,
                  regions: currentRegions,
                  mediums: currentMediums,
                  dateFrom: currentDateFrom,
                  dateTo: currentDateTo,
                }}
                onApply={applyFilters}
                onClear={clearFilters}
              />
            </PopoverContent>
          </Popover>
          <button className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700">
            <Download className="size-4" />
            Export
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-y border-zinc-200 text-zinc-500">
              <th className="w-10 px-6 py-3">
                <input
                  type="checkbox"
                  className="size-4 rounded border-zinc-300"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected
                  }}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-3 py-3 font-medium">Artist</th>
              <th className="px-3 py-3 font-medium">Artwork title</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">
                <span className="flex items-center gap-1">
                  Submitted
                  <ChevronDown className="size-3.5" />
                </span>
              </th>
              <th className="w-10 px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {artworks.map((item) => (
              <tr
                onClick={() => router.push(`/admin/submissions/${item._id}`)}
                key={item._id}
                className="border-b border-zinc-100 last:border-0 bg-white transition-colors hover:bg-zinc-200"
              >
                <td className="px-6 py-4 align-top" onClick={(event) => event.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="size-4 rounded border-zinc-300"
                    checked={selectedIds.includes(item._id)}
                    onChange={() => toggleOne(item._id)}
                  />
                </td>
                <td className="px-3 py-4 align-top">
                  <div className="font-medium text-zinc-900">{item.participant.name}</div>
                  <div className="text-xs text-zinc-500">{item.participant.state}</div>
                </td>
                <td className="px-3 py-4 align-top">
                  <div className="font-medium text-zinc-900">{item.title}</div>
                  <div className="text-xs text-zinc-500">{item.medium}</div>
                </td>
                <td className="px-3 py-4 align-top">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[item.status]}`}
                  >
                    {statusLabels[item.status]}
                  </span>
                </td>
                <td className="px-3 py-4 align-top">
                  <div className="font-medium text-zinc-900">
                    {formatDateCreated(item.dateCreated)}
                  </div>
                </td>
                <td className="w-10 px-6 py-4 align-top" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4">
        <p className="text-sm text-zinc-500">
          Showing {rangeStart} to {rangeEnd} of {total} results
        </p>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationLink
                href={page > 1 ? buildUrl({ page: String(page - 1) }) : undefined}
                aria-label="Go to previous page"
                aria-disabled={page <= 1}
                className={page <= 1 ? 'pointer-events-none opacity-40' : undefined}
              >
                <ChevronLeft className="size-4" />
              </PaginationLink>
            </PaginationItem>
            {pageNumbers.map((pageNumber, index) =>
              pageNumber === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href={buildUrl({ page: String(pageNumber) })}
                    isActive={pageNumber === page}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationLink
                href={isNext ? buildUrl({ page: String(page + 1) }) : undefined}
                aria-label="Go to next page"
                aria-disabled={!isNext}
                className={!isNext ? 'pointer-events-none opacity-40' : undefined}
              >
                <ChevronRight className="size-4" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
