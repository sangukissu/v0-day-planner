"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CalendarDays, Brain, Feather, Users, Wrench } from "lucide-react"
import type * as React from "react"
import type { Mode } from "@/components/types"

export function LeftRail({
  view = "day",
  onChangeView,
  activeModes = [],
  onToggleMode,
  onNewTask,
  onToday,
  onAutoArrange,
}: {
  view?: "day" | "week"
  onChangeView?: (v: "day" | "week") => void
  activeModes?: Mode[]
  onToggleMode?: (m: Mode) => void
  onNewTask?: () => void
  onToday?: () => void
  onAutoArrange?: () => void
}) {
  const ModeBtn = ({
    icon: Icon,
    label,
    mode,
  }: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    mode: Mode
  }) => {
    const active = activeModes?.includes(mode)
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={active ? "default" : "ghost"}
            size="icon"
            aria-label={label}
            className="rounded-md"
            onClick={() => onToggleMode?.(mode)}
          >
            <Icon className="size-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2 p-2">
        {/* View toggle */}
        <div className="rounded-md border border-border p-2">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" />
            <span>Planner View</span>
          </div>
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && onChangeView?.(v as any)}
            className="w-full"
          >
            <ToggleGroupItem value="day" className="flex-1">
              Day
            </ToggleGroupItem>
            <ToggleGroupItem value="week" className="flex-1">
              Week
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Separator className="my-1" />

        {/* Mode filters */}
        <div className="rounded-md border border-border p-2">
          <div className="mb-2 text-xs text-muted-foreground">Modes</div>
          <div className="grid grid-cols-4 gap-1">
            <ModeBtn icon={Brain} label="Deep" mode="Deep" />
            <ModeBtn icon={Feather} label="Light" mode="Light" />
            <ModeBtn icon={Users} label="Social" mode="Social" />
            <ModeBtn icon={Wrench} label="Admin" mode="Admin" />
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-md border border-border p-2">
          <div className="mb-2 text-xs text-muted-foreground">Quick</div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => onNewTask?.()}>
              New Block
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => onToday?.()}>
              Today
            </Button>
          </div>
          <div className="mt-2">
            <Button className="w-full" variant="default" onClick={() => onAutoArrange?.()}>
              Auto-Arrange
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
