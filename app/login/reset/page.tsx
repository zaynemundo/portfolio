import { Suspense } from "react";
import { LoginShell } from "../LoginShell";
import { ResetForm } from "./ResetForm";

export const metadata = {
  title: "Set new password | Zayne Mundo",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <LoginShell title="Set a new password">
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </LoginShell>
  );
}
