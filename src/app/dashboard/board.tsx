"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useOptimistic, useState, useTransition } from "react";
import { STATUSES, type Status } from "@/lib/status";
import { moveJob } from "./actions";

export type BoardJob = {
  id: string;
  company: string;
  title: string;
  meta: string;
  status: Status;
  daysInStage: number;
};

const statusLabel = (id: unknown) => STATUSES.find((s) => s.id === id)?.label ?? String(id);

/** Left/right arrows jump the held card a whole column instead of a few pixels. */
const columnKeyboardCoordinates: KeyboardCoordinateGetter = (event, { context }) => {
  const step = event.code === "ArrowRight" ? 1 : event.code === "ArrowLeft" ? -1 : 0;
  if (!step) return undefined;
  event.preventDefault();

  const order = STATUSES.map((s) => s.id as string);
  const current = context.over?.id ?? context.active?.data.current?.status;
  const next = order[Math.min(order.length - 1, Math.max(0, order.indexOf(String(current)) + step))];
  const rect = context.droppableRects.get(next);
  return rect ? { x: rect.left + 12, y: rect.top + 40 } : undefined;
};

export function Board({ jobs }: { jobs: BoardJob[] }) {
  const [optimisticJobs, applyMove] = useOptimistic(
    jobs,
    (current, move: { id: string; status: Status }) =>
      current.map((j) => (j.id === move.id ? { ...j, status: move.status, daysInStage: 0 } : j)),
  );
  const [, startTransition] = useTransition();
  // Stable id so dnd-kit's accessibility ids match between server and browser.
  const dndId = useId();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mouse drags start after a small move so clicks still open the job.
  // Touch drags need a short press so the board can still scroll sideways.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    // Space picks a card up; Enter is left free to open the job.
    useSensor(KeyboardSensor, {
      keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Space", "Enter"] },
      coordinateGetter: columnKeyboardCoordinates,
      scrollBehavior: "auto",
    }),
  );

  const companyOf = (id: unknown) => optimisticJobs.find((j) => j.id === id)?.company ?? "Job";
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${companyOf(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `${companyOf(active.id)} is over ${statusLabel(over.id)}.` : `${companyOf(active.id)} is not over a column.`,
    onDragEnd: ({ active, over }) =>
      over ? `${companyOf(active.id)} moved to ${statusLabel(over.id)}.` : `${companyOf(active.id)} was dropped.`,
    onDragCancel: ({ active }) => `Cancelled. ${companyOf(active.id)} stayed where it was.`,
  };

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id));
    setError(null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over) return;
    const id = String(active.id);
    const status = over.id as Status;
    if (optimisticJobs.find((j) => j.id === id)?.status === status) return;

    startTransition(async () => {
      applyMove({ id, status });
      try {
        await moveJob(id, status);
      } catch {
        setError("That move didn't save. Check your connection and try again.");
      }
    });
  }

  const activeJob = optimisticJobs.find((j) => j.id === activeId);

  return (
    <div className="space-y-3">
      {error && (
        <p role="alert" className="rounded-input bg-primary-soft px-3 py-2 text-sm text-primary-soft-foreground">
          {error}
        </p>
      )}
      <p className="text-sm text-muted">
        Drag cards between columns to update their status. With a keyboard, press Space to pick a card up and Enter to
        open it.
      </p>
      <DndContext
        id={dndId}
        sensors={sensors}
        accessibility={{ announcements }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
          {STATUSES.map((status) => (
            <Column
              key={status.id}
              status={status}
              jobs={optimisticJobs.filter((j) => j.status === status.id)}
            />
          ))}
        </div>
        <DragOverlay>{activeJob ? <CardBody job={activeJob} lifted /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}

function Column({ status, jobs }: { status: (typeof STATUSES)[number]; jobs: BoardJob[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status.id });
  return (
    <section
      ref={setNodeRef}
      aria-label={`${status.label}, ${jobs.length} ${jobs.length === 1 ? "job" : "jobs"}`}
      className={`flex min-h-64 w-64 shrink-0 flex-col rounded-card bg-surface-muted p-3 transition-shadow sm:w-auto sm:min-w-52 sm:flex-1 ${
        isOver ? "ring-2 ring-primary/40" : ""
      }`}
    >
      <h2 className="mb-3 flex items-center gap-2 font-sans text-sm font-medium tracking-normal">
        <span className={`size-2 rounded-full ${status.dot}`} aria-hidden />
        {status.label}
        <span className="font-normal text-muted">{jobs.length}</span>
      </h2>
      <ul className="flex flex-1 flex-col gap-2">
        {jobs.map((job) => (
          <DraggableCard key={job.id} job={job} />
        ))}
        {jobs.length === 0 && (
          <li className="rounded-input border border-dashed px-3 py-6 text-center text-xs text-muted">Drop here</li>
        )}
      </ul>
    </section>
  );
}

function DraggableCard({ job }: { job: BoardJob }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: job.id,
    data: { status: job.status },
  });
  const router = useRouter();
  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onKeyDown={(e) => {
        listeners?.onKeyDown?.(e);
        if (e.key === "Enter" && !isDragging) router.push(`/dashboard/jobs/${job.id}`);
      }}
      aria-roledescription="Draggable job"
      aria-label={`${job.company}, ${job.title}`}
      className={`cursor-grab touch-manipulation rounded-input active:cursor-grabbing ${isDragging ? "opacity-40" : ""}`}
    >
      <CardBody job={job} />
    </li>
  );
}

function CardBody({ job, lifted }: { job: BoardJob; lifted?: boolean }) {
  return (
    <div className={`rounded-input border bg-surface p-3 ${lifted ? "rotate-2 shadow-lg" : "hover:border-muted/50"}`}>
      <Link
        href={`/dashboard/jobs/${job.id}`}
        className="font-serif text-base font-medium hover:text-primary hover:underline"
        tabIndex={-1}
      >
        {job.company}
      </Link>
      <p className="text-sm text-muted">{job.title}</p>
      <p className="mt-2 flex justify-between gap-2 text-xs text-muted">
        <span className="truncate">{job.meta}</span>
        <span className="shrink-0">{job.daysInStage === 0 ? "today" : `${job.daysInStage}d`}</span>
      </p>
    </div>
  );
}
