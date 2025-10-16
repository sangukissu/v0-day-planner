"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Empty } from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { useState, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Ritual } from "@/components/types"

export function RightStack({
  onOpenCommand,
  rituals = [],
  onCreateRitual,
  onStampRitual,
  onRenameRitual,
  onDeleteRitual,
  energyPeakHour = 10,
  onChangeEnergyPeakHour,
  onAutoArrange,
}: {
  onOpenCommand?: () => void
  rituals?: Ritual[]
  onCreateRitual?: (name: string, fromUnplaced: boolean) => void
  onStampRitual?: (id: string, autoArrange?: boolean) => void
  onRenameRitual?: (id: string, name: string) => void
  onDeleteRitual?: (id: string) => void
  energyPeakHour?: number
  onChangeEnergyPeakHour?: (h: number) => void
  onAutoArrange?: () => void
}) {
  const { toast } = useToast()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState<string>("")

  // mini 24h bar preview and "best hours" text
  const energyBars = useMemo(() => {
    // simple symmetric bump around peak for preview only
    const levels = Array.from({ length: 24 }, (_, h) => {
      const dist = Math.min(Math.abs(h - energyPeakHour), 24 - Math.abs(h - energyPeakHour))
      return Math.max(1, Math.min(5, Math.round(3 + Math.max(0, 2.5 - dist * 0.6))))
    })
    const best = [...levels]
      .map((v, h) => ({ v, h }))
      .sort((a, b) => b.v - a.v || a.h - b.h)
      .slice(0, 3)
      .sort((a, b) => a.h - b.h)
      .map((x) => `${String(x.h).padStart(2, "0")}:00`)
    return { levels, best }
  }, [energyPeakHour])

  const startRename = (r: Ritual) => {
    setEditingId(r.id)
    setDraftName(r.name)
  }
  const commitRename = (id: string) => {
    const name = draftName.trim()
    if (!name) return
    onRenameRitual?.(id, name)
    setEditingId(null)
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <Accordion type="multiple" defaultValue={["backlog", "rituals", "energy"]}>
        <AccordionItem value="backlog" className="rounded-md border border-border px-2">
          <AccordionTrigger>Backlog</AccordionTrigger>
          <AccordionContent className="pb-3">
            <Empty
              className="bg-transparent"
              title="Backlog from Command"
              description="Add quick items with ⌘K, then place them on the clock or auto-arrange."
            >
              <div className="flex gap-2">
                <Button variant="outline" onClick={onOpenCommand}>
                  Open Command (⌘K)
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    onAutoArrange?.()
                    toast({ title: "Arranging day", description: "Placing blocks near your peak hours." })
                  }}
                >
                  Auto-Arrange
                </Button>
              </div>
            </Empty>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rituals" className="rounded-md border border-border px-2">
          <AccordionTrigger>Rituals</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                Create a reusable bundle from your backlog (unplaced items).
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    onCreateRitual?.("New Ritual", true)
                    toast({ title: "Ritual created", description: "Rename it and stamp when ready." })
                  }}
                >
                  Create from Backlog
                </Button>
              </div>
            </div>
            <Separator className="my-2" />
            {rituals.length === 0 && (
              <p className="text-sm text-muted-foreground">No rituals yet. Create one from your backlog.</p>
            )}
            {rituals.map((r) => (
              <div key={r.id} className="rounded-md border border-border p-2 flex items-center justify-between gap-2">
                <div className="flex-1">
                  {editingId === r.id ? (
                    <Input
                      autoFocus
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      onBlur={() => {
                        if (draftName.trim()) onRenameRitual?.(r.id, draftName.trim())
                        setEditingId(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && draftName.trim()) {
                          onRenameRitual?.(r.id, draftName.trim())
                          setEditingId(null)
                        }
                        if (e.key === "Escape") setEditingId(null)
                      }}
                    />
                  ) : (
                    <button
                      className="text-sm font-medium text-left hover:underline"
                      onClick={() => {
                        setEditingId(r.id)
                        setDraftName(r.name)
                      }}
                      aria-label={`Rename ritual ${r.name}`}
                    >
                      {r.name}
                    </button>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onStampRitual?.(r.id, false)
                      toast({ title: "Added to day", description: "Blocks added to Backlog." })
                    }}
                  >
                    Add to Day
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => {
                      onStampRitual?.(r.id, true)
                      toast({ title: "Stamped & Arranged", description: "Placed near your peak hours." })
                    }}
                  >
                    Stamp + Arrange
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDeleteRitual?.(r.id)} aria-label="Delete ritual">
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="energy" className="rounded-md border border-border px-2">
          <AccordionTrigger>Energy Peak</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2">
            <p className="text-xs text-muted-foreground">
              Pick the hour you’re usually sharpest. Auto‑Arrange prefers brighter bars below.
            </p>
            <div
              className="grid gap-[2px]"
              style={{ gridTemplateColumns: "repeat(24, minmax(0,1fr))" }}
              aria-label="Energy preview bars"
            >
              {energyBars.levels.map((lv, i) => (
                <div
                  key={i}
                  aria-hidden
                  className="h-3 rounded-sm"
                  style={{
                    background:
                      lv >= 5
                        ? "var(--primary)"
                        : lv >= 4
                          ? "color-mix(in oklab, var(--primary) 70%, var(--muted))"
                          : lv >= 3
                            ? "color-mix(in oklab, var(--primary) 45%, var(--muted))"
                            : "var(--muted)",
                  }}
                  title={`${String(i).padStart(2, "0")}:00 energy ${lv}`}
                />
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              Best hours today: <span className="font-mono">{energyBars.best.join(", ")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs w-10 text-muted-foreground">0h</div>
              <Slider
                value={[energyPeakHour]}
                min={0}
                max={23}
                step={1}
                onValueChange={(v) => onChangeEnergyPeakHour?.(v[0] ?? 10)}
                className="flex-1"
              />
              <div className="text-xs w-10 text-right text-muted-foreground">23h</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenCommand?.()}>
                Add items (⌘K)
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  onAutoArrange?.()
                  toast({ title: "Arranging day", description: "Placing blocks near your peak hours." })
                }}
              >
                Arrange Now
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="templates" className="rounded-md border border-border px-2">
          <AccordionTrigger>Templates</AccordionTrigger>
          <AccordionContent className="pb-3">
            <p className="text-sm text-muted-foreground">Keep day or week templates for quick planning.</p>
            <Separator className="my-2" />
            <Button variant="outline">New Template</Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
