"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import { cn } from "@/libs/utils"

/* ─ wrappers simples ─ */
export const Dialog = (p: React.ComponentProps<typeof DialogPrimitive.Root>) => (
  <DialogPrimitive.Root data-slot="dialog" {...p} />
)
export const DialogTrigger = (
  p: React.ComponentProps<typeof DialogPrimitive.Trigger>,
) => <DialogPrimitive.Trigger data-slot="dialog-trigger" {...p} />
export const DialogPortal = (
  p: React.ComponentProps<typeof DialogPrimitive.Portal>,
) => <DialogPrimitive.Portal data-slot="dialog-portal" {...p} />
export const DialogClose = (
  p: React.ComponentProps<typeof DialogPrimitive.Close>,
) => <DialogPrimitive.Close data-slot="dialog-close" {...p} />
export const DialogOverlay = ({
  className,
  ...p
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) => (
  <DialogPrimitive.Overlay
    data-slot="dialog-overlay"
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
      className,
    )}
    {...p}
  />
)

/* ───────── DialogContent ───────── */
interface DialogContentProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    "initialFocus"
  > {
  hideCloseButton?: boolean
  initialFocus?: React.RefObject<HTMLElement>
}

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(function DialogContent(
  { className, children, hideCloseButton, initialFocus, ...p },
  ref,
) {
  React.useEffect(() => {
    if (initialFocus?.current) {
      initialFocus.current.focus();
    }
  }, [initialFocus]);

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="dialog-content"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-full max-w-[calc(100%-2rem)]",
          "-translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
          className,
        )}
        {...p}
      >
        {children}

        {!hideCloseButton && (
          <DialogPrimitive.Close
            className="absolute right-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})

/* ───────── extras ───────── */
export const DialogHeader = ({
  className,
  ...p
}: React.ComponentProps<"div">) => (
  <div
    data-slot="dialog-header"
    className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
    {...p}
  />
)
export const DialogFooter = ({
  className,
  ...p
}: React.ComponentProps<"div">) => (
  <div
    data-slot="dialog-footer"
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className,
    )}
    {...p}
  />
)
export const DialogTitle = ({
  className,
  ...p
}: React.ComponentProps<typeof DialogPrimitive.Title>) => (
  <DialogPrimitive.Title
    data-slot="dialog-title"
    className={cn("text-lg font-semibold leading-none", className)}
    {...p}
  />
)
export const DialogDescription = ({
  className,
  ...p
}: React.ComponentProps<typeof DialogPrimitive.Description>) => (
  <DialogPrimitive.Description
    data-slot="dialog-description"
    className={cn("text-sm text-muted-foreground", className)}
    {...p}
  />
)

/* ───────── exports ───────── */
