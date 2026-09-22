import { ForgotForm } from "./ForgotForm";

export const metadata = {
  title: "Reset password | Zaira Mundo",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm mb-8 text-center">
        <span className="text-[14px] font-extrabold tracking-tight text-white">
          ZM
        </span>
        <h1 className="mt-4 text-[20px] font-semibold text-zinc-100">
          Forgot password
        </h1>
        <p className="mt-1.5 text-[13px] text-zinc-500">
          We&apos;ll email you a link to reset it.
        </p>
      </div>

      <ForgotForm />
    </div>
  );
}
