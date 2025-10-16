"use client"

import { useMemo, useState, useEffect } from "react"
import useSWR from "swr"
import { addDays, format, startOfDay } from "date-fns"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RadialClock } from "@/components/radial-clock"
import { TaskForm } from "@/components/task-form"
import { TaskLists } from "@/components/task-lists"
import type { Category, PlannerTask, Mode, Ritual } from "@/components/types"
import { DownloadIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { v4 as uuid } from "uuid"
import { AppShell } from "@/components/layout/app-shell"
import { buildEnergyCurve, deadlineTension, autoArrange, defaultModeForCategory, stampRitual } from "@/lib/planner"
import { useToast } from "@/hooks/use-toast"

// Local storage backed SWR
const swrFetcher = (key: string) => {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(key)
  try {
    const arr = raw ? (JSON.parse(raw) as PlannerTask[]) : []
    return arr.map(migrateTask)
  } catch {
    return []
  }
}

function migrateTask(t: PlannerTask): PlannerTask {
  // Fill new fields without breaking old data
  const mode: Mode = t.mode ?? defaultModeForCategory(t.category)
  const energyCost = t.energyCost ?? (mode === "Deep" ? 4 : 3)
  return {
    ...t,
    mode,
    energyCost,
    energyGain: t.energyGain ?? 0,
    deadlineISO: t.deadlineISO ?? null,
    priority: t.priority ?? 3,
    constraints: t.constraints ?? undefined,
    recurrence: t.recurrence ?? { pattern: "none" },
  }
}

function useDayTasks(date: Date) {
  const key = useMemo(() => `planner:tasks:${format(date, "yyyy-MM-dd")}`, [date])
  const { data, mutate } = useSWR<PlannerTask[]>(key, swrFetcher, { fallbackData: [] })

  const save = async (tasks: PlannerTask[]) => {
    // Save locally and mutate without revalidation
    localStorage.setItem(key, JSON.stringify(tasks))
    await mutate(tasks, { revalidate: false })
  }

  return { tasks: data || [], save }
}

function useRituals() {
  const key = "planner:rituals"
  const { data, mutate } = useSWR<Ritual[]>(
    key,
    () => {
      const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null
      return raw ? (JSON.parse(raw) as Ritual[]) : []
    },
    { fallbackData: [] },
  )
  const save = async (rits: Ritual[]) => {
    localStorage.setItem(key, JSON.stringify(rits))
    await mutate(rits, { revalidate: false })
  }
  return { rituals: data || [], saveRituals: save }
}

function useEnergyPeak(date: Date) {
  const key = `planner:energy-peak:${format(date, "yyyy-MM-dd")}`
  const { data, mutate } = useSWR<number>(
    key,
    () => {
      const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null
      return raw ? Number.parseInt(raw, 10) : 10
    },
    { fallbackData: 10 },
  )
  const save = async (peak: number) => {
    localStorage.setItem(key, String(peak))
    await mutate(peak, { revalidate: false })
  }
  return { energyPeakHour: data ?? 10, setEnergyPeakHour: save }
}

function formatTotal(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h > 0 ? `${h}h` : ""}${h > 0 && m > 0 ? "" : ""}${m > 0 ? `${h > 0 ? "" : ""}${m}m` : h === 0 ? "0m" : ""}`
}

export default function Page() {
  const [date, setDate] = useState<Date>(startOfDay(new Date()))
  const [open, setOpen] = useState(false)
  const [timeMode, setTimeMode] = useState<"24h" | "12h">("24h")
  const [half, setHalf] = useState<"AM" | "PM">("AM")
  const [placingTaskId, setPlacingTaskId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [now, setNow] = useState<Date>(new Date())
  const { tasks, save } = useDayTasks(date)
  const { rituals, saveRituals } = useRituals()
  const { energyPeakHour, setEnergyPeakHour } = useEnergyPeak(date)
  const { toast } = useToast()

  // mode filters
  const [activeModes, setActiveModes] = useState<Mode[]>([])
  const toggleMode = (m: Mode) =>
    setActiveModes((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))

  // filtered views (display only)
  const matchesMode = (t: PlannerTask) =>
    activeModes.length === 0 ? true : activeModes.includes(t.mode ?? defaultModeForCategory(t.category))
  const scheduled = tasks
    .filter((t) => t.startMin !== null)
    .filter(matchesMode)
    .sort((a, b) => (a.startMin || 0) - (b.startMin || 0))
  const unplaced = tasks.filter((t) => t.startMin === null).filter(matchesMode)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const onCreate = async (task: PlannerTask) => {
    await save([...(tasks || []), task])
    setOpen(false)
  }

  const onSchedule = async (taskId: string, startMin: number) => {
    const next = tasks.map((t) => (t.id === taskId ? { ...t, startMin } : t))
    await save(next)
  }

  const onUnschedule = async (taskId: string) => {
    const next = tasks.map((t) => (t.id === taskId ? { ...t, startMin: null } : t))
    await save(next)
  }

  const onDelete = async (taskId: string) => {
    const next = tasks.filter((t) => t.id !== taskId)
    await save(next)
  }

  const onMoveTask = async (id: string, startMin: number) => {
    // keep duration
    const t = tasks.find((x) => x.id === id)
    if (!t) return
    const next = tasks.map((x) => (x.id === id ? { ...x, startMin } : x))
    await save(next)
  }

  const onResizeTask = async (id: string, startMin: number, durationMin: number) => {
    const next = tasks.map((x) => (x.id === id ? { ...x, startMin, durationMin } : x))
    await save(next)
  }

  function toggleTimeMode() {
    setTimeMode((m) => {
      const next = m === "24h" ? "12h" : "24h"
      if (next === "12h") {
        const h = new Date().getHours()
        setHalf(h < 12 ? "AM" : "PM")
      }
      return next
    })
  }

  const onSplitTask = async (id: string, splitAtMin: number) => {
    const t = tasks.find((x) => x.id === id)
    if (!t || t.startMin == null) return
    const start = t.startMin
    const end = (t.startMin + t.durationMin) % (24 * 60)
    let split = splitAtMin
    // normalize across midnight
    const s = start
    let e = start + t.durationMin
    if (e <= s) e += 24 * 60
    if (split < s) split += 24 * 60
    if (split > e) split = e // clamp

    const durA = Math.max(5, Math.round((split - s) / 5) * 5)
    const durB = Math.max(5, t.durationMin - durA)
    const a = { ...t, id: uuid(), durationMin: durA }
    const b = { ...t, id: uuid(), startMin: (start + durA) % (24 * 60), durationMin: durB }
    const next = tasks.flatMap((x) => (x.id === id ? [a, b] : [x]))
    await save(next)
    // Previously selected the first half which could trigger Focus Mode.
    // Clear selection so the clock returns to normal view after split.
    setSelectedId(null)
  }

  function within(nowM: number, s: number, d: number) {
    let e = s + d
    if (e <= s) e += 24 * 60
    if (nowM < s) nowM += 24 * 60
    return nowM >= s && nowM <= e
  }

  const nowMin = now.getHours() * 60 + now.getMinutes()
  const selected = scheduled.find((t) => t.id === selectedId) || null
  const isActive =
    selected && selected.startMin != null ? within(nowMin, selected.startMin, selected.durationMin) : false
  const remaining =
    selected && selected.startMin != null
      ? ((selected.startMin + selected.durationMin - nowMin + 24 * 60) % (24 * 60)) * 60 - now.getSeconds()
      : 0

  const totalScheduled = scheduled.reduce((acc, t) => acc + t.durationMin, 0)
  const byCat = scheduled.reduce(
    (acc, t) => {
      acc[t.category] += t.durationMin
      return acc
    },
    { Focus: 0, Admin: 0, Creative: 0, Break: 0 } as Record<Category, number>,
  )

  const exportJSON = () => {
    const payload = {
      date: format(date, "yyyy-MM-dd"),
      tasks,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `planner-${format(date, "yyyy-MM-dd")}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tensionById = Object.fromEntries(tasks.map((t) => [t.id, deadlineTension(t, date)]))

  const onCreateRitual = async (name: string, fromUnplaced: boolean) => {
    const blocks = (fromUnplaced ? tasks.filter((t) => t.startMin === null) : []).map((t) => ({
      title: t.title,
      icon: t.icon,
      durationMin: t.durationMin,
      color: t.color,
      category: t.category,
      mode: t.mode,
      preferredStartMin: null,
    }))
    const next: Ritual[] = [...rituals, { id: `${Date.now().toString(36)}`, name, blocks }]
    await saveRituals(next)
    toast({
      title: "Ritual saved",
      description:
        blocks.length > 0
          ? `Captured ${blocks.length} backlog item${blocks.length > 1 ? "s" : ""}.`
          : "Ritual is empty. Add items first or create later from backlog.",
    })
  }

  const onRenameRitual = async (id: string, name: string) => {
    const next = rituals.map((r) => (r.id === id ? { ...r, name } : r))
    await saveRituals(next)
    toast({ title: "Ritual renamed", description: `"${name}"` })
  }

  const onDeleteRitual = async (id: string) => {
    const removed = rituals.find((r) => r.id === id)
    const next = rituals.filter((r) => r.id !== id)
    await saveRituals(next)
    toast({ title: "Ritual deleted", description: removed ? removed.name : "" })
  }

  const onStampRitual = async (ritualId: string, arrange: boolean) => {
    const r = rituals.find((x) => x.id === ritualId)
    if (!r) return
    if (r.blocks.length === 0) {
      toast({
        title: "Ritual is empty",
        description: "Add items to the ritual before stamping.",
        variant: "destructive",
      })
      return
    }
    const stamped = stampRitual(r, date)
    const next = [...tasks, ...stamped]
    await save(next)
    toast({
      title: "Added to day",
      description: `${stamped.length} block${stamped.length > 1 ? "s" : ""} added to Backlog.`,
    })
    if (arrange) {
      await onAutoArrange()
    }
  }

  const onAutoArrange = async () => {
    const curve = buildEnergyCurve(energyPeakHour, 3)
    const res = autoArrange({
      day: date,
      scheduled: tasks.filter((t) => t.startMin != null),
      unplaced: tasks.filter((t) => t.startMin == null),
      energyCurve: curve,
    })
    if (res.length === 0) {
      toast({ title: "Nothing to arrange", description: "No backlog items to place." })
      return
    }
    const map = new Map(res.map((r) => [r.id, r.startMin]))
    const next = tasks.map((t) => (map.has(t.id) ? { ...t, startMin: map.get(t.id)! } : t))
    await save(next)
    toast({
      title: "Arranged",
      description: `Placed ${res.length} block${res.length > 1 ? "s" : ""} near your peak hours.`,
    })
  }

  // command + shell handlers
  const openNewTask = () => setOpen(true)
  const jumpToday = () => setDate(startOfDay(new Date()))

  return (
    <AppShell
      onNewTask={openNewTask}
      onJumpToday={jumpToday}
      onAutoArrange={onAutoArrange}
      leftView="day"
      onChangeLeftView={() => {}}
      activeModes={activeModes}
      onToggleMode={toggleMode}
      rituals={rituals}
      onCreateRitual={onCreateRitual}
      onStampRitual={onStampRitual}
      energyPeakHour={energyPeakHour}
      onChangeEnergyPeakHour={setEnergyPeakHour}
      onRenameRitual={onRenameRitual}
      onDeleteRitual={onDeleteRitual}
    >
      <main className="min-h-dvh w-full bg-background text-foreground flex flex-col">
        {/* Top toolbar */}
        <header className="flex items-center justify-between px-4 py-3 md:px-6" data-zen-hide>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-xs border-solid border border-gray-700 rounded-2xl px-3 h-6 bg-secondary cursor-pointer"
              onClick={toggleTimeMode}
              aria-label="Toggle 12/24 hours"
            >
              {timeMode === "24h" ? "24h" : "12h"}
            </Button>
            <span className="text-sm text-muted-foreground">{/* spacer for previous icon */}</span>

            {timeMode === "12h" && (
              <div
                role="tablist"
                aria-label="AM/PM"
                className="flex bg-secondary rounded-full p-1 items-start ml-0 px-1 py-1 border-solid border border-gray-700"
              >
                <Button
                  role="tab"
                  aria-selected={half === "AM"}
                  variant={half === "AM" ? "default" : "ghost"}
                  className="rounded-full text-xs px-1 h-4 cursor-pointer"
                  onClick={() => setHalf("AM")}
                >
                  AM
                </Button>
                <Button
                  role="tab"
                  aria-selected={half === "PM"}
                  variant={half === "PM" ? "default" : "ghost"}
                  className="rounded-full text-xs h-4 px-1 cursor-pointer"
                  onClick={() => setHalf("PM")}
                >
                  PM
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center bg-secondary border-gray-700 border rounded-3xl gap-1">
            <Button
              variant="ghost"
              className="p-0 rounded-full w-6 h-6 cursor-pointer"
              onClick={() => setDate((d) => addDays(d, -1))}
              aria-label="Previous day"
            >
              <ChevronLeftIcon className="h-2 w-2" />
            </Button>
            <div className="font-mono tabular-nums text-sm">{format(date, "MMM d")}</div>
            <Button
              variant="ghost"
              className="h-6 w-6 p-0 rounded-full cursor-pointer"
              onClick={() => setDate((d) => addDays(d, 1))}
              aria-label="Next day"
            >
              <ChevronRightIcon className="w-2 h-2" />
            </Button>
          </div>
        </header>

        {/* Placing hint */}
        {placingTaskId && (
          <div className="px-4 md:px-6 -mt-2 mb-2" data-zen-hide>
            <div className="mx-auto max-w-3xl text-center text-xs text-muted-foreground">
              Tap anywhere on the clock to place your task.
            </div>
          </div>
        )}

        {/* Clock and summary */}
        <section className="flex-1 grid md:grid-cols-2 gap-6 px-4 md:px-6 pb-24 md:pb-10" data-zen-scene>
          <div className="flex items-center justify-center" data-zen-keep data-zen-clock-area>
            <RadialClock
              date={date}
              tasks={scheduled}
              placing={!!placingTaskId}
              mode={timeMode}
              half={half}
              onTapPlace={(startMin) => {
                if (!placingTaskId) return
                onSchedule(placingTaskId, startMin)
                setPlacingTaskId(null)
              }}
              onDropSchedule={(taskId, startMin) => onSchedule(taskId, startMin)}
              onMoveTask={onMoveTask}
              onResizeTask={onResizeTask}
              onSelectTask={(id) => setSelectedId(id)}
              onSplitTask={onSplitTask}
              onRequestReset={() => setSelectedId(null)}
            >
              {!selected && (
                <div className="text-center select-none pointer-events-none">
                  <div className="text-xl md:text-2xl font-semibold tracking-wide">
                    {format(date, "EEEE").toUpperCase()}
                  </div>
                  <div className="text-muted-foreground mt-1">{formatTotal(totalScheduled)} scheduled</div>
                  <div className="mt-4 space-y-1 text-left inline-block text-sm">
                    <div className="flex items-center justify-between gap-6">
                      <span className="text-[var(--task-focus)]">FOCUS</span>
                      <span className="font-mono tabular-nums text-muted-foreground">{formatTotal(byCat.Focus)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-6">
                      <span className="text-[var(--task-admin)]">ADMIN</span>
                      <span className="font-mono tabular-nums text-muted-foreground">{formatTotal(byCat.Admin)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-6">
                      <span className="text-[var(--task-creative)]">CREATIVE</span>
                      <span className="font-mono tabular-nums text-muted-foreground">
                        {formatTotal(byCat.Creative)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {selected && !isActive && (
                <div className="pointer-events-none text-center">
                  <div className="text-lg md:text-xl font-semibold">{selected.title}</div>
                  <div className="mt-1 text-muted-foreground text-sm font-mono tabular-nums">
                    {Math.floor(selected.durationMin / 60)}h{selected.durationMin % 60}m • {selected.category}
                  </div>
                  <div className="mt-3 text-xs opacity-70">(Double-tap the arc to edit, long-press to split)</div>
                </div>
              )}
              {selected && isActive && (
                <div className="pointer-events-none text-center">
                  <div className="text-xs tracking-wide opacity-70">Focus Mode</div>
                  <div className="text-3xl md:text-4xl font-mono tabular-nums mt-1">
                    {String(Math.floor(Math.max(0, remaining) / 60)).padStart(2, "0")}:
                    {String(Math.max(0, remaining) % 60).padStart(2, "0")}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">until task end</div>
                </div>
              )}
            </RadialClock>
          </div>

          {/* Lists */}
          <div className="max-w-lg mx-auto w-full" data-zen-hide>
            <TaskLists
              scheduled={scheduled}
              unplaced={unplaced}
              onUnschedule={onUnschedule}
              onDelete={onDelete}
              onRequestPlace={(id) => setPlacingTaskId(id)}
              timeMode={timeMode}
              tensionById={tensionById}
            />
          </div>
        </section>

        {/* Bottom actions */}
        <div
          className="fixed left-0 right-0 bottom-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border"
          data-zen-hide
        >
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between gap-3">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl px-5 h-11 gap-2 cursor-pointer">
                  <PlusIcon className="h-4 w-4" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-center">Create New Task</DialogTitle>
                </DialogHeader>
                <TaskForm onCreate={onCreate} />
              </DialogContent>
            </Dialog>
            <Button variant="secondary" className="rounded-xl h-11 px-5 cursor-pointer" onClick={exportJSON}>
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </main>
    </AppShell>
  )
}
