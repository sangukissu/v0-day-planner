"use client"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { CalendarDays, PlusCircle, Search, Timer, Layout } from "lucide-react"

export function CommandK({
  open,
  onOpenChange,
  onNewBlock,
  onJumpToday,
  onAutoArrange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onNewBlock?: () => void
  onJumpToday?: () => void
  onAutoArrange?: () => void
}) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => {
              onOpenChange(false)
              onNewBlock?.()
            }}
          >
            <PlusCircle className="mr-2 size-4" />
            New block
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onOpenChange(false)
              onAutoArrange?.()
            }}
          >
            <Timer className="mr-2 size-4" />
            Auto-arrange
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onOpenChange(false)
              onJumpToday?.()
            }}
          >
            <CalendarDays className="mr-2 size-4" />
            Jump to Today
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => onOpenChange(false)}>
            <Layout className="mr-2 size-4" />
            Planner
          </CommandItem>
          <CommandItem onSelect={() => onOpenChange(false)}>
            <Search className="mr-2 size-4" />
            Search backlog
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
