"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, Trash2 } from "lucide-react";
import { archiveFreelanceProject, deleteFreelanceProject } from "@/app/actions/freelance";
import { RowMenu, RowMenuItem } from "@/app/(admin)/_components/ui/RowMenu";

export function FreelanceCardMenu({ id, name, archived }: { id: string; name: string; archived: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggleArchive() {
    startTransition(async () => {
      await archiveFreelanceProject(id, !archived);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!window.confirm(`Delete "${name}" and all its tasks? This can't be undone.`)) return;
    startTransition(async () => {
      await deleteFreelanceProject(id);
      router.refresh();
    });
  }

  return (
    <RowMenu disabled={isPending}>
      <RowMenuItem onClick={toggleArchive} icon={<Archive size={14} />}>
        {archived ? "Unarchive" : "Archive"}
      </RowMenuItem>
      <RowMenuItem onClick={handleDelete} danger icon={<Trash2 size={14} />}>
        Delete
      </RowMenuItem>
    </RowMenu>
  );
}
