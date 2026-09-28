import { requireSession } from "@/app/lib/session";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { ChangePasswordForm } from "./ChangePasswordForm";

export default async function AccountPage() {
  const session = await requireSession();

  return (
    <div>
      <PageHeader title="Account" subtitle={`Signed in as ${session.user.email}.`} />

      <ChangePasswordForm />
    </div>
  );
}
