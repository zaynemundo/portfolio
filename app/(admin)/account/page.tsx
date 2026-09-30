import { requireSession } from "@/app/lib/session";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { AccountOverview } from "./AccountOverview";
import { ChangePasswordForm } from "./ChangePasswordForm";

export default async function AccountPage() {
  const session = await requireSession();

  return (
    <div>
      <PageHeader title="Settings" subtitle={`Signed in as ${session.user.email}.`} />

      <AccountOverview email={session.user.email} />
      <ChangePasswordForm />
    </div>
  );
}
