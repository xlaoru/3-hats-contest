"use client"

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
} from "@/components/ui/pagination"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronLeft, ChevronRight, Download, Eye, Search, SlidersHorizontal } from "lucide-react"

const tabs = [
    { label: "All", count: 126, active: true },
    { label: "Pending review", count: 23 },
    { label: "Approved", count: 68 },
    { label: "Published", count: 54 },
    { label: "Clarification required", count: 8 },
    { label: "Rejected", count: 11 },
    { label: "Withdrawn", count: 3 },
]

const statusStyles: Record<string, string> = {
    "Pending review": "bg-amber-100 text-amber-700",
    "Clarification required": "bg-violet-100 text-violet-700",
    Approved: "bg-emerald-100 text-emerald-700",
    Published: "bg-blue-100 text-blue-700",
    Rejected: "bg-red-100 text-red-700",
    Withdrawn: "bg-zinc-200 text-zinc-600",
}

const submissions = [
    { reference: "3HATS-126", artist: "Jane Smith", region: "Victoria", title: "Reclining Pose", medium: "Charcoal on paper, 50 x 70 cm", status: "Pending review", date: "Aug 4, 2025", time: "2:15 PM" },
    { reference: "3HATS-125", artist: "Liam Brown", region: "New South Wales", title: "Seated Figure Study", medium: "Graphite on paper, 42 x 59 cm", status: "Pending review", date: "Aug 4, 2025", time: "11:07 AM" },
    { reference: "3HATS-124", artist: "Emma Wilson", region: "Queensland", title: "Standing Nude", medium: "Conte on paper, 60 x 80 cm", status: "Clarification required", date: "Aug 3, 2025", time: "4:32 PM" },
    { reference: "3HATS-123", artist: "Noah Davis", region: "Victoria", title: "Torso Study", medium: "Charcoal on paper, 30 x 40 cm", status: "Approved", date: "Aug 3, 2025", time: "9:18 AM" },
    { reference: "3HATS-122", artist: "Olivia Taylor", region: "South Australia", title: "Back Study", medium: "Graphite on paper, 50 x 65 cm", status: "Published", date: "Aug 2, 2025", time: "7:45 AM" },
    { reference: "3HATS-121", artist: "William Lee", region: "Western Australia", title: "Seated Twist", medium: "Charcoal on paper, 45 x 60 cm", status: "Rejected", date: "Aug 2, 2025", time: "1:22 PM" },
    { reference: "3HATS-120", artist: "Sophie Martin", region: "Victoria", title: "Life Drawing No. 3", medium: "Ink on paper, 29.7 x 42 cm", status: "Published", date: "Aug 1, 2025", time: "6:05 PM" },
    { reference: "3HATS-119", artist: "James Thomas", region: "New South Wales", title: "Reclining Figure", medium: "Charcoal on paper, 70 x 100 cm", status: "Withdrawn", date: "Aug 1, 2025", time: "10:11 AM" },
]

export default function Table() {
    return (
        <div className="w-full rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center gap-6 overflow-x-auto border-b border-zinc-200 px-6">
                {tabs.map((tab) => (
                    <div
                        key={tab.label}
                        className={`whitespace-nowrap border-b-2 py-4 text-sm ${tab.active
                            ? "border-zinc-900 font-medium text-zinc-900"
                            : "border-transparent text-zinc-500"
                            }`}
                    >
                        {tab.label} <span className="text-zinc-400">{tab.count}</span>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="relative w-full max-w-sm">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search by name, title or reference..."
                        className="w-full rounded-lg border border-zinc-200 py-2 pr-3 pl-9 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none"
                    />
                </div>
                <div className="flex shrink-0 items-center gap-3">
                    <Popover>
                        <PopoverTrigger className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700">
                            <SlidersHorizontal className="size-4" />
                            Filters
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-80 gap-4 p-4">
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-medium text-zinc-500">Status</p>
                                <div className="flex flex-col gap-2">
                                    {["Pending review", "Approved", "Published", "Clarification required", "Rejected", "Withdrawn"].map((status) => (
                                        <label key={status} className="flex items-center gap-2 text-sm text-zinc-700">
                                            <Checkbox />
                                            {status}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-medium text-zinc-500">Region</p>
                                <div className="flex flex-col gap-2">
                                    {["Victoria", "New South Wales", "Queensland", "South Australia", "Western Australia"].map((region) => (
                                        <label key={region} className="flex items-center gap-2 text-sm text-zinc-700">
                                            <Checkbox />
                                            {region}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-medium text-zinc-500">Medium</p>
                                <div className="flex flex-col gap-2">
                                    {["Charcoal", "Graphite", "Conte", "Ink"].map((medium) => (
                                        <label key={medium} className="flex items-center gap-2 text-sm text-zinc-700">
                                            <Checkbox />
                                            {medium}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-t border-zinc-200 pt-3">
                                <button className="text-sm text-zinc-500">Clear all</button>
                                <button className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white">Apply filters</button>
                            </div>
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
                                <input type="checkbox" className="size-4 rounded border-zinc-300" />
                            </th>
                            <th className="px-3 py-3 font-medium">Reference</th>
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
                        {submissions.map((item) => (
                            <tr key={item.reference} className="border-b border-zinc-100 last:border-0">
                                <td className="px-6 py-4">
                                    <input type="checkbox" className="size-4 rounded border-zinc-300" />
                                </td>
                                <td className="px-3 py-4 font-medium text-zinc-900">{item.reference}</td>
                                <td className="px-3 py-4">
                                    <div className="font-medium text-zinc-900">{item.artist}</div>
                                    <div className="text-xs text-zinc-500">{item.region}</div>
                                </td>
                                <td className="px-3 py-4">
                                    <div className="font-medium text-zinc-900">{item.title}</div>
                                    <div className="text-xs text-zinc-500">{item.medium}</div>
                                </td>
                                <td className="px-3 py-4">
                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[item.status]}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-3 py-4">
                                    <div className="font-medium text-zinc-900">{item.date}</div>
                                    <div className="text-xs text-zinc-500">{item.time}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <Eye className="size-4 text-zinc-400" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4">
                <p className="text-sm text-zinc-500">Showing 1 to 8 of 126 results</p>
                <Pagination className="mx-0 w-auto">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationLink href="#" aria-label="Go to previous page">
                                <ChevronLeft className="size-4" />
                            </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#" isActive>1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">2</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">3</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">16</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#" aria-label="Go to next page">
                                <ChevronRight className="size-4" />
                            </PaginationLink>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}
