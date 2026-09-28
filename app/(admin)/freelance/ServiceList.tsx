"use client";

import { useState, useTransition } from "react";
import { addService, updateServiceDates, deleteService } from "@/app/actions/freelance";

interface Service {
  id: string;
  name: string;
  startDate: string; // yyyy-mm-dd or ""
  endDate: string; // yyyy-mm-dd or ""
}

export function ServiceList({ projectId, services }: { projectId: string; services: Service[] }) {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const n = name;
    setName("");
    startTransition(() => addService(projectId, n));
  }

  return (
    <div>
      <h2 className="text-[13.5px] font-semibold text-zinc-100 mb-3">Services</h2>

      <div className="space-y-2 mb-3">
        {services.map((service) => (
          <ServiceRow key={service.id} projectId={projectId} service={service} />
        ))}
        {services.length === 0 && <p className="text-[13px] text-zinc-600 py-2">No services added yet.</p>}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a service…"
          style={{ outline: "none" }}
          className="flex-1 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-[13.5px] text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 transition-colors"
        />
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="rounded-lg border border-zinc-700 text-zinc-300 text-[12.5px] font-medium px-3.5 hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </div>
  );
}

function ServiceRow({ projectId, service }: { projectId: string; service: Service }) {
  const [startDate, setStartDate] = useState(service.startDate);
  const [endDate, setEndDate] = useState(service.endDate);
  const [isPending, startTransition] = useTransition();

  function save(nextStart: string, nextEnd: string) {
    startTransition(() => updateServiceDates(service.id, projectId, nextStart, nextEnd));
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2.5 group">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[13.5px] text-zinc-200">{service.name}</span>
        <button
          type="button"
          onClick={() => startTransition(() => deleteService(service.id, projectId))}
          disabled={isPending}
          className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-[13px] disabled:opacity-30"
          aria-label="Delete service"
        >
          ×
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          onBlur={() => save(startDate, endDate)}
          style={{ outline: "none" }}
          className="rounded-md bg-zinc-800/60 px-2 py-1 text-[12px] text-zinc-300"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          onBlur={() => save(startDate, endDate)}
          style={{ outline: "none" }}
          className="rounded-md bg-zinc-800/60 px-2 py-1 text-[12px] text-zinc-300"
        />
      </div>
    </div>
  );
}
