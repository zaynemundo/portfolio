import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in | Zaira Mundo",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm mb-8 text-center">
        <span className="text-[14px] font-extrabold tracking-tight text-white">
          ZM
        </span>
        <h1 className="mt-4 text-[20px] font-semibold text-zinc-100">
          Admin sign in
        </h1>
        <p className="mt-1.5 text-[13px] text-zinc-500">
          Restricted access.
        </p>
      </div>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
