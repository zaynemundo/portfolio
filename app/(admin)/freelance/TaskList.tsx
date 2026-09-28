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
        <h2 className="text-[15px] font-semibold text-foreground">Tasks</h2>
        <span className="text-[12px] text-muted-foreground">{done}/{tasks.length} done</span>
      </div>

      {tasks.length === 0 ? (
        <p className="text-[13px] text-muted-foreground/70 mb-4">No tasks yet.</p>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden mb-4">
          <table className="w-full text-left">
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-border last:border-b-0 hover:bg-card/40 transition-colors group">
                  <td className="px-4 py-2.5 w-8">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={(e) => startTransition(() => toggleTask(task.id, projectId, e.target.checked))}
                      className="rounded border-border bg-card"
                    />
                  </td>
                  <td className={`px-2 py-2.5 text-[13.5px] w-full ${task.done ? "text-muted-foreground line-through" : "text-foreground/90"}`}>
                    {task.title}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => startTransition(() => deleteTask(task.id, projectId))}
                      className="text-muted-foreground/70 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 text-[13px]"
                      aria-label="Delete task"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
