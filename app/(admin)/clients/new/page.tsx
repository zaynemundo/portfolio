import { ClientForm } from "../ClientForm";

export default function NewClientPage() {
  return (
    <div>
      <h1 className="text-[22px] font-semibold text-zinc-100 mb-8">New client</h1>
      <ClientForm mode="new" />
    </div>
  );
}
