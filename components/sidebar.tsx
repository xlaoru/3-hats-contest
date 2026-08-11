'use client'

import { FileText, LogOut, Settings, Star, Trophy, Vote } from 'lucide-react'

import Link from 'next/link'

import { signOutAction } from '@/lib/actions/auth.action'

const navItems = [
  { label: 'Submissions', icon: FileText, href: '/admin/submissions' },
  { label: 'Judging', icon: Star, href: '/admin/judging' },
  { label: 'Voting', icon: Vote, href: '/admin/voting' },
  { label: 'Winners', icon: Trophy, href: '/admin/winners' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
]

export function Sidebar() {
  return (
    <aside className="flex h-screen w-36 shrink-0 flex-col overflow-hidden bg-[#0b0f19] text-zinc-300">
      <div className="shrink-0">
        <Link
          href="/admin/submissions"
          className="block bg-zinc-100 py-4 text-center text-lg font-bold tracking-wide text-zinc-900"
        >
          3HATS
        </Link>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col items-center gap-9 overflow-y-auto py-10">
        {navItems.map(({ label, icon: Icon, href }) => (
          <Link
            href={href}
            key={label}
            className="flex flex-col items-center gap-2 text-xs text-zinc-300 transition-colors hover:text-white cursor-pointer"
          >
            <Icon className="h-6 w-6" strokeWidth={1.5} />
            {label}
          </Link>
        ))}
      </nav>
      <form action={signOutAction} className="shrink-0">
        <button
          type="submit"
          className="flex items-center gap-2 border-t border-zinc-800 px-6 py-5 text-sm text-zinc-300 transition-colors hover:text-white cursor-pointer"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          Sign out
        </button>
      </form>
    </aside>
  )
}
