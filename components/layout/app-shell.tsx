"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { CommandK } from "@/components/layout/command-k"
import { LeftRail } from "@/components/layout/left-rail"
import { RightStack } from "@/components/layout/right-stack"
import { Menu, PanelLeft, PanelRight, Search } from "lucide-react"
import Link from "next/link"
import type { Mode } from "@/components/types"
import type { Ritual } from "@/components/types"
import { useZenGesture } from "@/hooks/use-zen-gesture"

type AppShellProps = {
  children: React.ReactNode
  onNewTask?: () => void
  onJumpToday?: () => void
  onAutoArrange?: () => void
  leftView?: "day" | "week"
  onChangeLeftView?: (v: "day" | "week") => void
  activeModes?: Array<Mode>
  onToggleMode?: (m: Mode) => void
  rituals?: Ritual[]
  onCreateRitual?: (name: string, fromUnplaced: boolean) => void
  onStampRitual?: (id: string, autoArrange?: boolean) => void
  onRenameRitual?: (id: string, name: string) => void
  onDeleteRitual?: (id: string) => void
  energyPeakHour?: number
  onChangeEnergyPeakHour?: (h: number) => void
}

export function AppShell({
  children,
  onNewTask,
  onJumpToday,
  onAutoArrange,
  leftView,
  onChangeLeftView,
  activeModes,
  onToggleMode,
  rituals,
  onCreateRitual,
  onStampRitual,
  onRenameRitual,
  onDeleteRitual,
  energyPeakHour,
  onChangeEnergyPeakHour,
}: AppShellProps) {
  const [leftOpen, setLeftOpen] = React.useState(false)
  const [rightOpen, setRightOpen] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [zen, setZen] = React.useState(false)

  // ⌘K / Ctrl+K opens command palette
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC")
      const cmd = isMac ? e.metaKey : e.ctrlKey
      if (cmd && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setCommandOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useZenGesture(() => setZen((v) => !v), { velocityThreshold: 0.6, minDx: 30, windowMs: 1300, bidirectional: true })
  React.useEffect(() => {
    const el = document.body
    if (!el) return
    el.classList.toggle("zen-active", zen)
    return () => {
      el.classList.remove("zen-active")
    }
  }, [zen])

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Top bar */}
      <header
        className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        data-zen-hide
      >
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-3 sm:px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open left rail"
              onClick={() => setLeftOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
            <span className="text-sm font-medium text-muted-foreground">Day-planner</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="hidden sm:inline-flex gap-2 bg-transparent"
              onClick={() => setCommandOpen(true)}
              aria-label="Open command palette"
            >
              <Search className="size-4" />
              <span className="text-sm">Search / Command</span>
              <kbd className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">⌘K</kbd>
            </Button>
            <Link href="/docs" aria-label="Open documentation" className="hidden sm:inline-flex">
              <span className="inline-flex items-center rounded-md px-3 h-9 border border-border bg-card hover:bg-secondary text-sm">
                Docs
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open right panel"
              onClick={() => setRightOpen(true)}
            >
              <PanelRight className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Desktop grid */}
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-3 sm:px-4 py-4 lg:grid-cols-[220px_1fr_320px]">
        <aside className="hidden lg:block" data-zen-hide>
          <div className="rounded-lg border border-border bg-card">
            <div className="flex h-12 items-center gap-2 px-3 text-sm text-muted-foreground">
              <PanelLeft className="size-4" />
              Rail
            </div>
            <Separator />
            <LeftRail
              view={leftView}
              onChangeView={onChangeLeftView}
              activeModes={activeModes}
              onToggleMode={onToggleMode}
              onNewTask={onNewTask}
              onToday={onJumpToday}
              onAutoArrange={onAutoArrange}
            />
          </div>
        </aside>

        <main className="min-h-[60dvh]">{children}</main>

        <aside className="hidden lg:block" data-zen-hide>
          <div className="rounded-lg border border-border bg-card">
            <div className="flex h-12 items-center gap-2 px-3 text-sm text-muted-foreground">
              <PanelRight className="size-4" />
              Panels
            </div>
            <Separator />
            <RightStack
              onOpenCommand={() => setCommandOpen(true)}
              rituals={rituals}
              onCreateRitual={onCreateRitual}
              onStampRitual={onStampRitual}
              onRenameRitual={onRenameRitual}
              onDeleteRitual={onDeleteRitual}
              energyPeakHour={energyPeakHour}
              onChangeEnergyPeakHour={onChangeEnergyPeakHour}
              onAutoArrange={onAutoArrange}
            />
          </div>
        </aside>
      </div>

      {/* Mobile Left: Sheet */}
      <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
        <SheetContent side="left" className="w-[85vw] sm:w-[380px] p-0">
          <SheetHeader className="px-3 py-3">
            <SheetTitle className="text-sm">Rail</SheetTitle>
          </SheetHeader>
          <Separator />
          <div className="p-2">
            <LeftRail
              view={leftView}
              onChangeView={onChangeLeftView}
              activeModes={activeModes}
              onToggleMode={onToggleMode}
              onNewTask={onNewTask}
              onToday={onJumpToday}
              onAutoArrange={onAutoArrange}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Right: Drawer */}
      <Drawer open={rightOpen} onOpenChange={setRightOpen}>
        <DrawerContent className="p-0">
          <DrawerHeader className="px-3 py-3">
            <DrawerTitle className="text-sm">Panels</DrawerTitle>
          </DrawerHeader>
          <Separator />
          <div className="p-2">
            <RightStack
              onOpenCommand={() => setCommandOpen(true)}
              rituals={rituals}
              onCreateRitual={onCreateRitual}
              onStampRitual={onStampRitual}
              onRenameRitual={onRenameRitual}
              onDeleteRitual={onDeleteRitual}
              energyPeakHour={energyPeakHour}
              onChangeEnergyPeakHour={onChangeEnergyPeakHour}
              onAutoArrange={onAutoArrange}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Command Palette */}
      <CommandK
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onNewBlock={() => onNewTask?.()}
        onJumpToday={() => onJumpToday?.()}
        onAutoArrange={() => onAutoArrange?.()}
      />
    </div>
  )
}
