"use client"

// -----------------------------------------------------------------------------
// Complex Sidebar – full implementation (2025-07-30)
// Next 15 · React 19 · Tailwind 4 · TypeScript 5
// -----------------------------------------------------------------------------
// ✦ Features
//   • Collapsible (rail ⇆ full) no desktop, drawer no mobile
//   • Dark-mode diagonal stripes + orange fade (desligável)
//   • Zero aninhamento inválido (<button>/<li> dentro de <button>/<li>)
//   • Todos os exports são nomeados – não há bloco export { … } no final
// -----------------------------------------------------------------------------

import * as React from "react"
import Link, { type LinkProps } from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

// ajuste os caminhos conforme seu projeto
import { cn } from "@/libs/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"

/* ═══════════════ 1. Context & hook ═══════════════ */

type SidebarState = "expanded" | "collapsed"

interface SidebarCtx {
  state: SidebarState
  openMobile: boolean
  setOpenMobile: (v: boolean) => void
  toggle: () => void
  expand: () => void
  activeSubmenuId: string | null;
  setActiveSubmenuId: (id: string | null) => void;
}

const SidebarContext = React.createContext<SidebarCtx | null>(null)
export function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used within <SidebarProvider>")
  return ctx
}

/* ═══════════════ 2. Provider ═══════════════ */

interface SidebarProviderProps {
  defaultOpen?: boolean
  children: React.ReactNode
}

  export function SidebarProvider({ defaultOpen = true, children }: SidebarProviderProps) {
  const isMobile = useIsMobile()
  const [state, setState] = React.useState<SidebarState>(
    defaultOpen ? "expanded" : "collapsed",
  )
  const [openMobile, setOpenMobile] = React.useState(false)
  const [activeSubmenuId, setActiveSubmenuId] = React.useState<string | null>(null);

  const toggle = React.useCallback(() => {
    if (isMobile) setOpenMobile((v) => !v)
    else setState((s) => (s === "expanded" ? "collapsed" : "expanded"))
  }, [isMobile])

  const expand = React.useCallback(() => {
    if (!isMobile) setState("expanded")
  }, [isMobile])

  const value = React.useMemo<SidebarCtx>(
    () => ({ state, openMobile, setOpenMobile, toggle, expand, activeSubmenuId, setActiveSubmenuId }),
    [state, openMobile, toggle, expand, activeSubmenuId, setActiveSubmenuId],
  )

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  )
}

/* ═══════════════ 3. Contêiner principal ═══════════════ */

interface SidebarProps extends React.ComponentProps<"div"> {
  side?: "left" | "right"
  decorative?: boolean
  collapsible?: boolean
}

export function Sidebar({
  side = "left",
  decorative = true,
  collapsible = true,
  className,
  style,
  children,
  ...rest
}: SidebarProps) {
  const { state, openMobile, setOpenMobile } = useSidebar()
  const isMobile = useIsMobile()

  const WIDTH = "16rem" // 256 px
  const RAIL = "3.5rem" // 56 px

  /* —— mobile: Sheet —— */
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side={side}
          className="p-0 w-[16rem] bg-sidebar text-sidebar-foreground"
        >
          {children}
        </SheetContent>
      </Sheet>
    )
  }

  /* —— desktop: fixo —— */
  const width = !collapsible ? WIDTH : state === "expanded" ? WIDTH : RAIL

  return (
    <div
      data-slot="sidebar"
      className={cn(
        "flex h-svh flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 shadow-2xl dark:shadow-none",
        side === "right" && "order-last",
        className,
      )}
      style={{ width, ...style }}
      {...rest}
    >
      <div className="relative flex h-full flex-col rounded-none shadow-none">
        {decorative && (
          <>
            {/* listras – pretas, 4 % de opacidade */}
            <div
              aria-hidden
              className="
                pointer-events-none absolute inset-x-0 bottom-0 h-72
                dark:bg-[repeating-linear-gradient(135deg,_rgb(0_0_0_/_0.04)_0_8px,_transparent_8px_16px)]
              "
            />

            {/* fade laranja */}
            <div
              aria-hidden
              className="
                pointer-events-none absolute inset-x-0 bottom-0 h-72
                dark:bg-gradient-to-t dark:from-clerkStripe/30 dark:via-clerkStripe/10 dark:to-transparent
              "
            />
          </>
        )}
        {children}
      </div>
    </div>
  )
}

/* ═══════════════ 4. Helpers de layout ═══════════════ */

export const SidebarContent = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("flex-1 overflow-y-auto px-2", className)} {...props} />
)
export const SidebarHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("px-4 py-3 text-base font-semibold", className)} {...props} />
)
export const SidebarFooter = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("mt-auto px-4 py-3 text-xs text-zinc-400", className)} {...props} />
)
export const SidebarSeparator = (props: React.ComponentProps<typeof Separator>) => (
  <Separator className="my-2" {...props} />
)

/* ═══════════════ 5. Menu ═══════════════ */

export const SidebarMenu = ({ className, ...props }: React.ComponentProps<"ul">) => (
  <ul className={cn("space-y-1", className)} {...props} />
)

/* -- item (li + button/link) ---------------------------------------------- */

interface SidebarEntryPropsBase {
  active?: boolean
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  children: React.ReactNode
  className?: string
}

// Combina as props de link e botão, garantindo que `href` e `onClick` sejam mutuamente exclusivos.
// Omitimos props que serão gerenciadas pelo componente (`children`, `className`).
export type SidebarEntryProps = SidebarEntryPropsBase &
  (
    | ({ href: LinkProps["href"] } & Omit<
        LinkProps,
        "href" | "children" | "className"
      >)
    | ({ onClick: React.MouseEventHandler<HTMLButtonElement> } & Omit<
        React.ComponentProps<"button">,
        "onClick" | "children" | "className"
      >)
  )

export function SidebarEntry(props: SidebarEntryProps) {
  const { state } = useSidebar()
  const { active, icon: Icon, children, className, ...rest } = props

  const commonClasses = cn(
    "group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm",
    state === "collapsed" && "justify-center",
    active
      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
      : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100",
    className,
  )

  // Conteúdo interno: ícone + label (visível apenas se expandido)
  const content = (
    <>
      {Icon && <Icon className="size-4 shrink-0" strokeWidth={1.5} />}
      {state === "expanded" && children}
    </>
  )

  // Renderiza como <Link> do Next se `href` for passado
  if ("href" in rest) {
    return (
      <li>
        <Link {...(rest as Omit<LinkProps, "children">)} className={commonClasses}>
          {content}
        </Link>
      </li>
    )
  }

  // Renderiza como <button> se `onClick` for passado
  return (
    <li>
      <button
        type="button"
        {...(rest as Omit<React.ComponentProps<"button">, "children">)}
        className={commonClasses}
      >
        {content}
      </button>
    </li>
  )
}

/* -- submenu colapsável --------------------------------------------------- */
interface SubmenuProps {
  id: string;
  label: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  defaultOpen?: boolean
  children: React.ReactNode
}

export function SidebarSubmenu({
  id,
  label,
  icon: Icon,
  defaultOpen = false,
  children,
}: SubmenuProps) {
  const { state, expand, activeSubmenuId, setActiveSubmenuId } = useSidebar();
  const open = activeSubmenuId === id;

  React.useEffect(() => {
    if (state === "collapsed" && activeSubmenuId === id) {
      setActiveSubmenuId(null);
    }
  }, [state, activeSubmenuId, id, setActiveSubmenuId]);

  const handleClick = () => {
    if (state === "collapsed") {
      expand();
    }
    setActiveSubmenuId(open ? null : id);
  };

  return (
    <>
      <SidebarEntry icon={Icon} onClick={handleClick}>
        <span className="flex w-full items-center justify-between">
          {label}
          {state === "expanded" &&
            (open ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            ))}
        </span>
      </SidebarEntry>

      {open && state === "expanded" && (
        <ul className="mt-1 space-y-1 pl-8">{children}</ul>
      )}
    </>
  )
}

/* ═══════════════ 6. Utilitários ═══════════════ */

export function SidebarCollapseButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { state, toggle } = useSidebar()
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("my-2 mx-2", className)}
      onClick={toggle}
      {...props}
    >
      {state === "collapsed" ? (
        <ChevronRight className="size-4" />
      ) : (
        <ChevronLeft className="size-4" />
      )}
    </Button>
  )
}

export const SidebarInput = ({
  className,
  ...props
}: React.ComponentProps<typeof Input>) => (
  <Input className={cn("h-8 w-full bg-background shadow-none", className)} {...props} />
)

/* ──────────────────────────────── FIM ──────────────────────────────── */
