"use client";

import { useState, useTransition } from "react";
import { addTask, toggleTask, deleteTask } from "@/app/actions/freelance";

interface Task {
  id: string;
  title: string;
  done: boolean;
}

export function TaskList({ projectId, tasks }: { projectId: string; tasks: Task[] }) {
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const t = title;
    setTitle("");
    startTransition(() => addTask(projectId, t));
  }

  const done = tasks.filter((t) => t.done).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13.5px] font-semibold text-foreground">Tasks</h2>
        <span className="text-[12px] text-muted-foreground">{done}/{tasks.length} done</span>
      </div>

      <ul className="space-y-1.5 mb-4">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-card/40 px-3 py-2 group"
          >
            <input
              type="checkbox"
              checked={task.done}
              onChange={(e) => startTransition(() => toggleTask(task.id, projectId, e.target.checked))}
              className="rounded border-border bg-card"
            />
            <span className={`flex-1 text-[13.5px] ${task.done ? "text-muted-foreground line-through" : "text-foreground/90"}`}>
              {task.title}
            </span>
            <button
              type="button"
              onClick={() => startTransition(() => deleteTask(task.id, projectId))}
              className="text-muted-foreground/70 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 text-[13px]"
              aria-label="Delete task"
            >
              ×
            </button>
          </li>
        ))}
        {tasks.length === 0 && (
          <li className="text-[13px] text-muted-foreground/70 py-2">No tasks yet.</li>
        )}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task…"
          style={{ outline: "none" }}
          className="flex-1 rounded-lg bg-card border border-border px-3 py-2 text-[13.5px] text-foreground placeholder:text-muted-foreground/70 focus:border-ring transition-colors"
        />
        <button
          type="submit"
          disabled={isPending || !title.trim()}
          className="rounded-lg border border-border text-foreground/70 text-[12.5px] font-medium px-3.5 hover:bg-secondary transition-colors disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </div>
  );
}
