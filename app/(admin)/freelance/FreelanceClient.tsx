"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/app/(admin)/_components/Modal";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { StatusBadge } from "./StatusBadge";
import { ProjectForm } from "./ProjectForm";
import { ProjectActions } from "./ProjectActions";
import { TaskList } from "./TaskList";
import type { FreelanceProjectFormData } from "@/app/actions/freelance";
import type { ClientOption } from "@/app/(admin)/_components/ClientSelect";

export interface TaskRow {
  id: string;
  title: string;
  done: boolean;
}

export interface ProjectRow {
  id: string;
  name: string;
  clientId: string;
  clientName: string | null;
  status: string;
  description: string;
  rateAmount: string;
  rateCurrency: string;
  rateType: string;
  attachmentUrl: string;
  deadline: string; // yyyy-mm-dd
  displayDeadline: string;
  isOverdue: boolean;
  archived: boolean;
  tasks: TaskRow[];
}

export function FreelanceClient({ projects, clients: initialClients }: { projects: ProjectRow[]; clients: ClientOption[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<"new" | ProjectRow | null>(null);
  const [clients, setClients] = useState(initialClients);

  function addClient(client: ClientOption) {
    setClients((prev) => [...prev, client].sort((a, b) => a.name.localeCompare(b.name)));
  }

  function close() {
    setModal(null);
    router.refresh();
  }

  const editing = modal && modal !== "new" ? modal : null;
  const initial: Partial<FreelanceProjectFormData> | undefined = editing
    ? {
        name: editing.name, clientId: editing.clientId, status: editing.status, description: editing.description,
        rateAmount: editing.rateAmount, rateCurrency: editing.rateCurrency, rateType: editing.rateType,
        attachmentUrl: editing.attachmentUrl, deadline: editing.deadline,
      }
    : undefined;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold text-zinc-100">Freelance Projects</h1>
          <p className="text-[13px] text-zinc-500 mt-1">{projects.length} active project{projects.length === 1 ? "" : "s"}</p>
        </div>
        <button
          type="button"
          onClick={() => setModal("new")}
          className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-4 py-2 hover:bg-white transition-colors"
        >
          + New project
        </button>
      </div>

      {projects.length === 0 ? (
        <EmptyState message="No freelance projects yet." />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {projects.map((project) => {
            const doneCount = project.tasks.filter((t) => t.done).length;
            const totalCount = project.tasks.length;

            return (
              <button
                key={project.id}
                type="button"
                onClick={() => setModal(project)}
                className="text-left rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-[14.5px] font-semibold text-zinc-100">{project.name}</h3>
                  <StatusBadge status={project.status} />
                </div>
                {project.clientName && <p className="text-[12.5px] text-zinc-500 mb-3">{project.clientName}</p>}

                <div className="flex items-center justify-between text-[12px] text-zinc-500">
                  <span>{totalCount > 0 ? `${doneCount}/${totalCount} tasks done` : "No tasks yet"}</span>
                  {project.deadline && (
                    <span className={project.isOverdue ? "text-red-400 font-medium" : ""}>
                      {project.isOverdue ? "Overdue: " : "Due "}
                      {project.displayDeadline}
                    </span>
                  )}
                </div>

                {totalCount > 0 && (
                  <div className="mt-2.5 h-1 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(doneCount / totalCount) * 100}%` }} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <Modal open={modal !== null} onClose={close} title={editing ? editing.name : "New freelance project"} maxWidthClassName={editing ? "max-w-3xl" : "max-w-xl"}>
        {editing ? (
          <div className="grid grid-cols-[1fr_280px] gap-8">
            <div>
              <div className="flex justify-end mb-3">
                <ProjectActions id={editing.id} archived={editing.archived} onDeleted={close} />
              </div>
              <ProjectForm mode="edit" projectId={editing.id} initial={initial} clients={clients} onClientCreated={addClient} onSuccess={close} />
            </div>
            <TaskList projectId={editing.id} tasks={editing.tasks} />
          </div>
        ) : (
          <ProjectForm mode="new" clients={clients} onClientCreated={addClient} onSuccess={close} />
        )}
      </Modal>
    </div>
  );
}
