import { addDays, differenceInMinutes, parseISO, startOfDay } from "date-fns"
import type { PlannerTask, Mode, Ritual } from "@/components/types"
import { DAY_MINUTES, clampMinutes } from "@/lib/time"

export type EnergyCurve = number[] // 24-length array, values 1..5

export function buildEnergyCurve(peakHour: number, base = 3): EnergyCurve {
  // simple bell-ish around peak: energy = base + bonus*(cosine distance)
  const curve: number[] = Array.from({ length: 24 }, (_, h) => {
    const dist = Math.min(Math.abs(h - peakHour), 24 - Math.abs(h - peakHour))
    const bonus = Math.max(0, 2.5 - dist * 0.6) // peak ~ +2.5, falloff per hour
    return Math.max(1, Math.min(5, Math.round(base + bonus)))
  })
  return curve
}

export function defaultModeForCategory(cat: PlannerTask["category"]): Mode {
  switch (cat) {
    case "Focus":
      return "Deep"
    case "Admin":
      return "Admin"
    case "Creative":
      return "Light"
    case "Break":
      return "Social"
    default:
      return "Light"
  }
}

export function deadlineTension(task: PlannerTask, day: Date): number {
  if (!task.deadlineISO) return 0
  const endOfDay = addDays(startOfDay(day), 1)
  const now = startOfDay(day) // day-based tension
  const deadline = parseISO(task.deadlineISO)
  const until = differenceInMinutes(deadline, now)
  if (until <= 0) return 1
  const slack = until - task.durationMin
  if (slack <= 0) return 1
  // scale with 12h soft zone
  return Math.max(0, Math.min(1, 1 - slack / (12 * 60)))
}

function overlaps(aStart: number, aDur: number, bStart: number, bDur: number) {
  let aEnd = aStart + aDur
  let bEnd = bStart + bDur
  if (aEnd <= aStart) aEnd += DAY_MINUTES
  if (bEnd <= bStart) bEnd += DAY_MINUTES
  const s = Math.max(aStart, bStart)
  const e = Math.min(aEnd, bEnd)
  return e > s
}

function canPlace(task: PlannerTask, startMin: number) {
  const c = task.constraints
  if (!c) return true
  if (c.notBeforeMin != null && startMin < c.notBeforeMin) return false
  if (c.mustEndByMin != null) {
    const end = (startMin + task.durationMin) % DAY_MINUTES
    // if crosses midnight consider invalid for mustEndBy
    if (end <= startMin) return false
    if (end > c.mustEndByMin) return false
  }
  if (c.windowStartMin != null && c.windowEndMin != null) {
    const ws = c.windowStartMin
    const we = c.windowEndMin
    const end = (startMin + task.durationMin) % DAY_MINUTES
    if (!(startMin >= ws && end <= we && end > startMin)) return false
  }
  return true
}

export function autoArrange({
  day,
  scheduled,
  unplaced,
  energyCurve,
}: {
  day: Date
  scheduled: PlannerTask[]
  unplaced: PlannerTask[]
  energyCurve: EnergyCurve
}): Array<{ id: string; startMin: number }> {
  // sort unplaced by priority desc, tension desc, energy desc, duration desc
  const scored = unplaced.map((t) => ({
    t,
    prio: t.priority ?? 3,
    tens: deadlineTension(t, day),
    e: t.energyCost ?? 3,
  }))
  scored.sort((a, b) => {
    if (b.prio !== a.prio) return b.prio - a.prio
    if (b.tens !== a.tens) return b.tens - a.tens
    if (b.e !== a.e) return b.e - a.e
    return b.t.durationMin - a.t.durationMin
  })

  const placed: Array<{ id: string; startMin: number; durationMin: number }> = scheduled
    .filter((t) => t.startMin != null)
    .map((t) => ({ id: t.id, startMin: t.startMin!, durationMin: t.durationMin }))

  const result: Array<{ id: string; startMin: number }> = []

  const isSlotFree = (startMin: number, dur: number) =>
    !placed.some((p) => overlaps(p.startMin, p.durationMin, startMin, dur))

  for (const s of scored) {
    const t = s.t
    // generate candidate starts by energy preference (around peak first)
    const candidates: number[] = []
    for (let h = 0; h < 24; h++) {
      // prefer higher energy hours first
      candidates.push(h * 60)
    }
    candidates.sort((a, b) => (energyCurve[Math.floor(b / 60)] ?? 3) - (energyCurve[Math.floor(a / 60)] ?? 3))

    let chosen: number | null = null
    for (const base of candidates) {
      // Try within this hour at 5-min snaps
      for (let off = 0; off < 60; off += 5) {
        const start = clampMinutes(base + off)
        if (!canPlace(t, start)) continue
        if (!isSlotFree(start, t.durationMin)) continue
        chosen = start
        break
      }
      if (chosen != null) break
    }
    if (chosen != null) {
      placed.push({ id: t.id, startMin: chosen, durationMin: t.durationMin })
      result.push({ id: t.id, startMin: chosen })
    }
  }

  return result
}

export function stampRitual(ritual: Ritual, day: Date): PlannerTask[] {
  // create tasks with null start; consumer may auto-arrange afterwards
  return ritual.blocks.map((b, i) => ({
    id: `rit-${ritual.id}-${i}-${Date.now().toString(36)}`,
    title: b.title,
    icon: b.icon,
    durationMin: b.durationMin,
    category: b.category ?? "Focus",
    color: b.color,
    startMin: b.preferredStartMin ?? null,
    mode: b.mode,
    energyCost: 3,
    energyGain: 0,
    deadlineISO: null,
    priority: 3,
    constraints: b.preferredStartMin != null ? { notBeforeMin: b.preferredStartMin } : undefined,
    recurrence: { pattern: "none" },
  }))
}
