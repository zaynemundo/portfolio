import { Suspense } from "react";
import { LoginShell } from "./LoginShell";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in | Zaira Mundo",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <LoginShell title="Admin sign in" subtitle="Restricted access.">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </LoginShell>
  );
}
