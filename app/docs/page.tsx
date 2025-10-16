import Link from "next/link"

export const metadata = {
  title: "Day-planner Docs",
  description: "How to use Day-planner: tasks, auto-arrange, energy curve, rituals, clock interactions, and more.",
}

export default function DocsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-balance">Day‑planner Documentation</h1>
        <p className="mt-2 text-muted-foreground">
          A concise guide to building your day with blocks, the orbit planner, auto‑arrange, energy curve, and rituals.
        </p>
      </header>

      <nav aria-label="On this page" className="mb-8">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <li>
            <a className="text-primary hover:underline" href="#overview">
              Overview
            </a>
          </li>
          <li>
            <a className="text-primary hover:underline" href="#concepts">
              Key concepts
            </a>
          </li>
          <li>
            <a className="text-primary hover:underline" href="#tasks">
              Tasks
            </a>
          </li>
          <li>
            <a className="text-primary hover:underline" href="#clock">
              Clock interactions
            </a>
          </li>
          <li>
            <a className="text-primary hover:underline" href="#intelligence">
              Planner intelligence
            </a>
          </li>
          <li>
            <a className="text-primary hover:underline" href="#rituals">
              Rituals
            </a>
          </li>
          <li>
            <a className="text-primary hover:underline" href="#filters">
              Views & filters
            </a>
          </li>
          <li>
            <a className="text-primary hover:underline" href="#export">
              Export & data
            </a>
          </li>
          <li>
            <a className="text-primary hover:underline" href="#shortcuts">
              Shortcuts
            </a>
          </li>
          <li>
            <a className="text-primary hover:underline" href="#troubleshooting">
              Troubleshooting
            </a>
          </li>
        </ul>
      </nav>

      <section id="overview" className="space-y-3 mb-10">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p>
          Day‑planner uses time‑blocks on a radial day view. Build your plan by creating tasks (blocks), placing them on
          the clock, or letting Auto‑Arrange schedule unplaced items based on priority, deadlines, and your energy
          curve.
        </p>
        <div className="rounded-lg border border-border bg-card p-3">
          <img
            src={"/placeholder.svg?height=260&width=560&query=Orbit%20planner%20day%20overview%20with%20blocks"}
            alt="Orbit planner overview diagram"
            className="w-full rounded-md"
          />
        </div>
      </section>

      <section id="concepts" className="space-y-3 mb-10">
        <h2 className="text-2xl font-semibold">Key concepts</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Blocks (Tasks): minimal units of work with title, duration, category, color, priority. Advanced options:
            deadline, energy, constraints, and recurrence.
          </li>
          <li>
            Scheduled vs Unplaced: Scheduled have a start time; Unplaced live in the backlog and can be auto‑arranged or
            placed manually.
          </li>
          <li>
            Energy Curve: Your preferred productivity peak hour per day; informs auto‑arrange (kept per‑day locally).
          </li>
          <li>
            Deadline Tension: A score indicating urgency based on time left and duration; shown subtly next to items.
          </li>
          <li>Rituals: Reusable bundles of blocks you can stamp into a day and optionally auto‑arrange.</li>
        </ul>
      </section>

      <section id="tasks" className="space-y-4 mb-10">
        <h2 className="text-2xl font-semibold">Tasks (Blocks)</h2>
        <p className="text-muted-foreground">
          The task form is intentionally minimal. Required: Title, Duration, Priority, Color. Advanced options are
          collapsed by default to keep the flow fast.
        </p>
        <div className="rounded-lg border border-border bg-card p-3">
          <img
            src={"/placeholder.svg?height=220&width=560&query=Task%20form%20fields%20quick%20and%20advanced"}
            alt="Task form quick and advanced fields diagram"
            className="w-full rounded-md"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-md border border-border p-3">
            <h3 className="font-medium mb-2">Quick fields</h3>
            <ul className="list-disc pl-6 text-sm space-y-1">
              <li>Title</li>
              <li>Duration: 15–90m presets</li>
              <li>Priority: P1–P4</li>
              <li>Color</li>
            </ul>
          </div>
          <div className="rounded-md border border-border p-3">
            <h3 className="font-medium mb-2">Advanced (optional)</h3>
            <ul className="list-disc pl-6 text-sm space-y-1">
              <li>Deadline: affects deadline tension score</li>
              <li>Energy required: default is derived; increase for harder blocks</li>
              <li>Constraints: not before, must end by</li>
              <li>Recurrence: none, daily, weekdays, weekly</li>
              <li>Icon: for quick visual identification</li>
            </ul>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Notes:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Mode is not exposed in the form; it’s implicitly derived from category when needed.</li>
            <li>Advanced options are optional—skip them to stay fast and minimal.</li>
          </ul>
        </div>
      </section>

      <section id="clock" className="space-y-3 mb-10">
        <h2 className="text-2xl font-semibold">Clock interactions</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Place an unplaced block by tapping the clock when prompted or dragging from Unplaced.</li>
          <li>Move: drag a placed arc clockwise or across the ring.</li>
          <li>Resize: drag arc handles; snap to 5‑minute increments.</li>
          <li>Split: long‑press or use the split interaction on the arc to divide a block at a moment in time.</li>
          <li>Focus scene: selecting a running block shows a countdown and minimal focus UI.</li>
        </ul>
      </section>

      <section id="intelligence" className="space-y-4 mb-10">
        <h2 className="text-2xl font-semibold">Planner intelligence</h2>
        <div className="rounded-lg border border-border bg-card p-3">
          <img
            src={"/placeholder.svg?height=220&width=560&query=Auto-arrange%20and%20energy%20curve%20flow"}
            alt="Auto-arrange and energy curve flow diagram"
            className="w-full rounded-md"
          />
        </div>
        <h3 className="font-medium">Auto‑Arrange</h3>
        <ul className="list-disc pl-6 text-sm space-y-1">
          <li>Sorts unplaced blocks by Priority (desc), Deadline Tension (desc), Energy (desc), Duration (desc).</li>
          <li>
            Generates candidate slots biased around your Energy Curve peak, then places blocks respecting constraints
            and avoiding collisions.
          </li>
          <li>Won’t place a block that violates “must end by” or crosses midnight when a constraint disallows it.</li>
        </ul>
        <h3 className="font-medium mt-4">Energy Curve</h3>
        <ul className="list-disc pl-6 text-sm space-y-1">
          <li>Set per day from Right panel → Energy Curve. Peak hour defaults to 10:00.</li>
          <li>Auto‑Arrange prefers hours near your peak.</li>
          <li>Stored locally per day; change it anytime.</li>
        </ul>
        <h3 className="font-medium mt-4">Deadline Tension</h3>
        <ul className="list-disc pl-6 text-sm space-y-1">
          <li>Based on time until deadline minus duration (slack).</li>
          <li>Tension approaches 1 as slack approaches 0; shown as a subtle dot next to the task title.</li>
        </ul>
      </section>

      <section id="rituals" className="space-y-3 mb-10">
        <h2 className="text-2xl font-semibold">Rituals</h2>
        <p>
          Rituals are reusable bundles created from your current unplaced backlog. Stamp them into today and optionally
          auto‑arrange in one click.
        </p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Build your backlog (unplaced tasks).</li>
          <li>Right panel → Rituals → “Create from Backlog”. Name your ritual.</li>
          <li>
            Later, select “Add to Day” (keeps them unplaced) or “Stamp + Arrange” (adds then auto‑arranges immediately).
          </li>
        </ol>
        <div className="rounded-lg border border-border bg-card p-3">
          <img
            src={"/placeholder.svg?height=220&width=560&query=Rituals%20create%20from%20backlog%20and%20stamp"}
            alt="Ritual flow diagram"
            className="w-full rounded-md"
          />
        </div>
      </section>

      <section id="filters" className="space-y-3 mb-10">
        <h2 className="text-2xl font-semibold">Views & filters</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Left rail: toggle Day/Week (week view may be simplified in this version).</li>
          <li>Mode filters: Deep, Light, Social, Admin filter the visual display (mode derives from category).</li>
          <li>Top toolbar: switch 24h/12h and navigate between days.</li>
          <li>Bottom bar: create a new task or export.</li>
        </ul>
      </section>

      <section id="export" className="space-y-3 mb-10">
        <h2 className="text-2xl font-semibold">Export & data</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Export JSON from the bottom bar.</li>
          <li>All data is local‑first via localStorage (tasks, rituals, energy peak).</li>
          <li>
            Clearing site data will remove your plan. Consider exporting before clearing or switching browsers/devices.
          </li>
        </ul>
      </section>

      <section id="shortcuts" className="space-y-3 mb-10">
        <h2 className="text-2xl font-semibold">Keyboard shortcuts</h2>
        <ul className="list-disc pl-6 space-y-2 text-sm">
          <li>⌘K / Ctrl‑K: Open Command palette</li>
          <li>← / →: Navigate days (via UI buttons)</li>
          <li>Enter in form: Create (when valid)</li>
        </ul>
      </section>

      <section id="troubleshooting" className="space-y-3 mb-10">
        <h2 className="text-2xl font-semibold">Troubleshooting</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Can’t see “Create” on mobile: The form keeps Create/Cancel in a footer that never overlays inputs; scroll
            within the form content if needed.
          </li>
          <li>
            Auto‑Arrange isn’t placing items: check constraints (“must end by” may block placement) or try adjusting the
            energy peak.
          </li>
          <li>
            Ritual not visible: Ensure you created it from unplaced items; rituals don’t include already scheduled
            blocks.
          </li>
        </ul>
      </section>

      <footer className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Day‑planner</span>
          <Link href="/" className="text-primary hover:underline">
            Back to app
          </Link>
        </div>
      </footer>
    </main>
  )
}
