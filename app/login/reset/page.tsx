import { Suspense } from "react";
import { ResetForm } from "./ResetForm";

export const metadata = {
  title: "Set new password | Zaira Mundo",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm mb-8 text-center">
        <span className="text-[14px] font-extrabold tracking-tight text-white">
          ZM
        </span>
        <h1 className="mt-4 text-[20px] font-semibold text-zinc-100">
          Set a new password
        </h1>
      </div>

      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
