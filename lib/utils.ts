import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Maps each item's `_id` to a unique slug derived from its title, appending
 * `-2`, `-3`, ... to later duplicates (ordered by `createdAt`) so items with
 * the same title don't collide on the same URL.
 */
export function buildSlugMap<T extends { _id: string; title: string; createdAt?: Date | string }>(
  items: T[],
): Map<string, string> {
  const counts = new Map<string, number>()
  const slugs = new Map<string, string>()

  const ordered = [...items].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return aTime - bTime
  })

  for (const item of ordered) {
    const base = slugify(item.title)
    const count = counts.get(base) ?? 0
    counts.set(base, count + 1)
    slugs.set(item._id, count === 0 ? base : `${base}-${count + 1}`)
  }

  return slugs
}
