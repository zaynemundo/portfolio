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
        <h2 className="text-[13.5px] font-semibold text-zinc-100">Tasks</h2>
        <span className="text-[12px] text-zinc-500">{done}/{tasks.length} done</span>
      </div>

      <ul className="space-y-1.5 mb-4">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 group"
          >
            <input
              type="checkbox"
              checked={task.done}
              onChange={(e) => startTransition(() => toggleTask(task.id, projectId, e.target.checked))}
              className="rounded border-zinc-700 bg-zinc-900"
            />
            <span className={`flex-1 text-[13.5px] ${task.done ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
              {task.title}
            </span>
            <button
              type="button"
              onClick={() => startTransition(() => deleteTask(task.id, projectId))}
              className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-[13px]"
              aria-label="Delete task"
            >
              ×
            </button>
          </li>
        ))}
        {tasks.length === 0 && (
          <li className="text-[13px] text-zinc-600 py-2">No tasks yet.</li>
        )}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task…"
          style={{ outline: "none" }}
          className="flex-1 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-[13.5px] text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 transition-colors"
        />
        <button
          type="submit"
          disabled={isPending || !title.trim()}
          className="rounded-lg border border-zinc-700 text-zinc-300 text-[12.5px] font-medium px-3.5 hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </div>
  );
}
