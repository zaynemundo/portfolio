import { LoginShell } from "../LoginShell";
import { ForgotForm } from "./ForgotForm";

export const metadata = {
  title: "Reset password | Zayne Mundo",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <LoginShell title="Forgot password" subtitle="We'll email you a link to reset it.">
      <ForgotForm />
    </LoginShell>
  );
}
