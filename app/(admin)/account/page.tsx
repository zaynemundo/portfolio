import { requireSession } from "@/app/lib/session";
import { ChangePasswordForm } from "./ChangePasswordForm";

export default async function AccountPage() {
  const session = await requireSession();

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-zinc-100 mb-1">Account</h1>
      <p className="text-[13px] text-zinc-500 mb-8">Signed in as {session.user.email}.</p>

      <ChangePasswordForm />
    </div>
  );
}
