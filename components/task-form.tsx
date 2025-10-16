"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { Category, PlannerTask, TaskConstraints, TaskRecurrence } from "./types"
import { cn } from "@/lib/utils"

const ICONS = ["💼", "📝", "☕️", "💻", "🎯", "📚", "🔬", "🧠", "🛠️"] as const
const DURATIONS = [15, 30, 45, 60, 90] as const
const CATS: Category[] = ["Focus", "Admin", "Creative", "Break"]
const COLORS = ["blue", "teal", "orange", "cyan", "pink"] as const
const RECURRENCE: TaskRecurrence["pattern"][] = ["none", "daily", "weekdays", "weekly"]

function timeToMin(v: string | null): number | null {
  if (!v) return null
  const [h, m] = v.split(":").map((n) => Number.parseInt(n || "0", 10))
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

export function TaskForm({ onCreate }: { onCreate: (task: PlannerTask) => void }) {
  const [title, setTitle] = useState("")
  const [icon, setIcon] = useState<string>(ICONS[1])
  const [duration, setDuration] = useState<number>(30)
  const [category, setCategory] = useState<Category>("Focus")
  const [color, setColor] = useState<"blue" | "teal" | "orange" | "cyan" | "pink">("blue")
  const [energy, setEnergy] = useState<number>(3)
  const [deadline, setDeadline] = useState<string>("")
  const [priority, setPriority] = useState<1 | 2 | 3 | 4>(3)
  const [notBefore, setNotBefore] = useState<string>("")
  const [mustEndBy, setMustEndBy] = useState<string>("")
  const [recurrence, setRecurrence] = useState<TaskRecurrence["pattern"]>("none")

  const canCreate = title.trim().length > 0

  const handleCreate = () => {
    if (!canCreate) return
    const constraints: TaskConstraints = {
      notBeforeMin: timeToMin(notBefore),
      mustEndByMin: timeToMin(mustEndBy),
    }
    const task: PlannerTask = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      icon,
      durationMin: duration,
      category,
      color,
      startMin: null,
      energyCost: energy,
      energyGain: 0,
      deadlineISO: deadline ? deadline : null,
      priority,
      constraints,
      recurrence: { pattern: recurrence },
    }
    onCreate(task)
  }

  return (
    <div className="flex flex-col max-h-[70vh] md:max-h-[80vh] min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto px-1 space-y-4 overscroll-contain">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Task title</label>
          <Input
            placeholder="Write brief, review PR..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Duration</div>
          <div className="flex gap-2 flex-wrap">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={cn(
                  "px-4 h-9 rounded-lg bg-secondary text-sm font-mono tabular-nums",
                  duration === d && "bg-primary text-primary-foreground",
                )}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Priority</div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p as 1 | 2 | 3 | 4)}
                  className={cn(
                    "px-3 h-9 rounded-lg bg-secondary text-sm flex-1 font-mono",
                    priority === p && "bg-primary text-primary-foreground",
                  )}
                >
                  P{p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Color</div>
            <div className="flex gap-2 justify-start">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="relative h-9 w-9 rounded-full flex items-center justify-center"
                >
                  <span
                    className={cn(
                      "h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-background",
                      color === c ? "ring-primary" : "ring-transparent",
                    )}
                    style={{ backgroundColor: `var(--task-${c})` }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <Accordion type="single" collapsible className="border-t pt-2">
          <AccordionItem value="advanced" className="border-none">
            <AccordionTrigger className="text-sm text-muted-foreground hover:no-underline py-2">
              Advanced options
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Icon</div>
                <div className="grid grid-cols-9 gap-2">
                  {ICONS.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIcon(i)}
                      className={cn(
                        "h-10 rounded-md bg-secondary flex items-center justify-center",
                        icon === i && "ring-2 ring-primary",
                      )}
                    >
                      <span className="text-lg">{i}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Category</div>
                <div className="flex gap-2 flex-wrap">
                  {CATS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={cn(
                        "px-3 h-9 rounded-lg bg-secondary text-sm",
                        category === c && "bg-primary text-primary-foreground",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Energy required</div>
                  <div className="text-xs font-mono tabular-nums text-muted-foreground">{energy}</div>
                </div>
                <Slider value={[energy]} min={1} max={5} step={1} onValueChange={(v) => setEnergy(v[0] ?? 3)} />
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Deadline</div>
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="h-11" />
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Constraints</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Not before</label>
                    <Input
                      type="time"
                      value={notBefore}
                      onChange={(e) => setNotBefore(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Must end by</label>
                    <Input
                      type="time"
                      value={mustEndBy}
                      onChange={(e) => setMustEndBy(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Recurrence</div>
                <div className="flex gap-2 flex-wrap">
                  {RECURRENCE.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRecurrence(r)}
                      className={cn(
                        "px-3 h-9 rounded-lg bg-secondary text-sm capitalize",
                        recurrence === r && "bg-primary text-primary-foreground",
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="shrink-0 pt-4 pb-3 md:pb-3 pb-[env(safe-area-inset-bottom)] bg-background border-t mt-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-xl bg-transparent"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button className="flex-1 h-11 rounded-xl" disabled={!canCreate} onClick={handleCreate}>
            Create
          </Button>
        </div>
      </div>
    </div>
  )
}
