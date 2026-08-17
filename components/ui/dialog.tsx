'use client'

import * as React from 'react'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogContent({
  className,
  children,
  showClose = true,
  ...props
}: DialogPrimitive.Popup.Props & { showClose?: boolean }) {
  const childArray = React.Children.toArray(children)
  const headerIndex = childArray.findIndex(
    (child) => React.isValidElement(child) && child.type === DialogHeader,
  )
  const header = headerIndex !== -1 ? childArray[headerIndex] : null
  const rest = headerIndex !== -1 ? childArray.filter((_, i) => i !== headerIndex) : childArray

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        data-slot="dialog-backdrop"
        className="fixed inset-0 z-50 bg-black/60 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
      />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          'fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-white shadow-lg outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
          className,
        )}
        {...props}
      >
        {header ? (
          <div className="sticky top-0 z-10 shrink-0 rounded-t-xl bg-white px-6 pt-6 pr-12">
            {header}
            {showClose && (
              <DialogPrimitive.Close
                className="absolute top-5 right-5 z-20 cursor-pointer text-zinc-400 hover:text-zinc-700"
                aria-label="Close"
              >
                <X size={18} />
              </DialogPrimitive.Close>
            )}
          </div>
        ) : (
          showClose && (
            <DialogPrimitive.Close
              className="absolute top-5 right-5 z-20 cursor-pointer text-zinc-400 hover:text-zinc-700"
              aria-label="Close"
            >
              <X size={18} />
            </DialogPrimitive.Close>
          )
        )}
        <div className={cn('min-h-0 flex-1 overflow-y-auto px-6', header ? 'pb-6' : 'py-6')}>
          {rest}
        </div>
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-header" className={cn('flex flex-col gap-1', className)} {...props} />
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-lg font-bold text-zinc-900', className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-sm text-zinc-500', className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex items-center justify-end gap-2', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
}
