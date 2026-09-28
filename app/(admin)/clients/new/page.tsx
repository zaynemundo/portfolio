import { ClientForm } from "../ClientForm";
import { BackLink } from "@/app/(admin)/_components/BackLink";
import { routes } from "@/app/(admin)/_routes";

export default function NewClientPage() {
  return (
    <div>
      <BackLink href={routes.clients.list} label="Clients" iconOnly />
      <div className="mt-4 max-w-xl">
        <ClientForm />
      </div>
    </div>
  );
}
