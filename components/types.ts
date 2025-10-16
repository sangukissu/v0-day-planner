export type Category = "Focus" | "Admin" | "Creative" | "Break"

export type Mode = "Deep" | "Light" | "Social" | "Admin"
export type Priority = 1 | 2 | 3 | 4

export type TaskConstraints = {
  // minutes from 00:00
  notBeforeMin?: number | null
  mustEndByMin?: number | null
  windowStartMin?: number | null
  windowEndMin?: number | null
}

export type TaskRecurrence = {
  pattern: "none" | "daily" | "weekdays" | "weekly"
}

export type PlannerTask = {
  id: string
  title: string
  icon: string // emoji or short glyph
  durationMin: number
  category: Category
  color: "blue" | "teal" | "orange" | "cyan" | "pink"
  startMin: number | null // minutes from 00:00, null = unplaced
  mode?: Mode | undefined
  energyCost?: number | undefined // 1-5
  energyGain?: number | undefined // optional, defaults 0
  deadlineISO?: string | null | undefined // e.g. "2025-10-15"
  priority?: Priority | undefined
  constraints?: TaskConstraints | undefined
  recurrence?: TaskRecurrence | undefined
}

export type RitualBlock = {
  title: string
  icon: string
  durationMin: number
  color: PlannerTask["color"]
  category?: Category
  mode?: Mode
  preferredStartMin?: number | null
}

export type Ritual = {
  id: string
  name: string
  blocks: RitualBlock[]
}
