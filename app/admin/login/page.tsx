import type { Metadata } from "next";
import { login } from "../../actions/admin-auth";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-[22px] font-bold text-white tracking-tight">ZM</span>
          <p className="text-[13px] text-zinc-500 mt-1">Admin access</p>
        </div>

        <form action={login} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7 space-y-4">
          {error && (
            <p className="text-[13px] text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
              Incorrect password. Try again.
            </p>
          )}
          <div>
            <label htmlFor="password" className="block text-[12px] font-medium text-zinc-400 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              placeholder="Enter admin password"
              className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-[14px] placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-white text-zinc-900 text-[14px] font-semibold hover:bg-zinc-100 transition-colors duration-150"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
