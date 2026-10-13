"use client";

import { useState, useTransition } from "react";
import { DateField } from "@/app/(admin)/_components/ui/DateField";
import { addTask, toggleTask, deleteTask, setTaskDueDate } from "@/app/actions/freelance";
import { Card, CardHeader } from "@/app/(admin)/_components/ui/Card";

interface Task {
  id: string;
  title: string;
  done: boolean;
  /** yyyy-mm-dd, or "" when the task has no due date. */
  dueDate: string;
}

const dateInput =
  "rounded-md bg-transparent border border-transparent hover:border-border focus:border-ring px-1.5 py-1 text-[12px] focus:outline-none transition-colors";

export function TaskList({ projectId, tasks, today }: { projectId: string; tasks: Task[]; today: string }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const t = title;
    const d = dueDate;
    setTitle("");
    setDueDate("");
    startTransition(() => addTask(projectId, t, d));
  }

  const done = tasks.filter((t) => t.done).length;

  return (
    <Card>
      <CardHeader
        title="Tasks"
        action={<span className="font-normal text-muted-foreground">{done}/{tasks.length} done</span>}
      />
      <div className="px-5 pb-5">

      {tasks.length === 0 ? (
        <p className="text-[12.5px] text-muted-foreground/70 mb-3">No tasks yet.</p>
      ) : (
        <table className="w-full text-left mb-3">
          <tbody>
            {tasks.map((task) => {
              const overdue = !task.done && task.dueDate !== "" && task.dueDate < today;
              return (
                <tr key={task.id} className="border-b border-border last:border-b-0 group">
                  <td className="py-2 pr-3 w-8">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={(e) => startTransition(() => toggleTask(task.id, projectId, e.target.checked))}
                      aria-label={`Mark "${task.title}" as ${task.done ? "not done" : "done"}`}
                      className="rounded border-border bg-card"
                    />
                  </td>
                  <td className={`py-2 text-[12.5px] w-full ${task.done ? "text-muted-foreground line-through" : "text-foreground/80"}`}>
                    {task.title}
                  </td>
                  <td className="py-1 whitespace-nowrap">
                    <DateField
                      compact
                      fullWidth={false}
                      placeholder="Due date"
                      value={task.dueDate}
                      onChange={(value) => startTransition(() => setTaskDueDate(task.id, projectId, value))}
                      aria-label={`Due date for "${task.title}"`}
                      title={overdue ? "Overdue" : "Due date"}
                      className={`${dateInput} ${overdue ? "text-destructive font-medium" : task.dueDate ? "text-muted-foreground" : "text-muted-foreground/60 opacity-0 group-hover:opacity-100 focus:opacity-100"}`}
                    />
                  </td>
                  <td className="py-2 pl-1 text-right">
                    <button
                      type="button"
                      onClick={() => startTransition(() => deleteTask(task.id, projectId))}
                      className="text-muted-foreground/70 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 text-[13px]"
                      aria-label={`Delete "${task.title}"`}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task…"
          aria-label="New task"
          style={{ outline: "none" }}
          className="flex-1 min-w-0 rounded-lg bg-card border border-border px-2.5 py-1.5 text-[12.5px] text-foreground placeholder:text-muted-foreground/70 focus:border-ring transition-colors"
        />
        <DateField
          fullWidth={false}
          placeholder="Due date"
          value={dueDate}
          onChange={setDueDate}
          aria-label="Due date for the new task"
          className="rounded-lg bg-card border border-border px-2 py-1.5 text-[12px] text-muted-foreground focus:outline-none focus:border-ring transition-colors"
        />
        <button
          type="submit"
          disabled={isPending || !title.trim()}
          className="rounded-lg border border-border text-foreground/70 text-[12px] font-medium px-2.5 hover:bg-secondary transition-colors disabled:opacity-50"
        >
          Add
        </button>
      </form>
      </div>
    </Card>
  );
}
