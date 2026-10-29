import { Suspense } from "react";
import { LoginShell } from "./LoginShell";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in | Zayne Mundo",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <LoginShell title="Welcome back" subtitle="Sign in to your workspace.">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </LoginShell>
  );
}
