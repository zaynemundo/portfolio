import Link from "next/link";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-[12.5px] text-zinc-500 hover:text-zinc-300 transition-colors">
      ← {label}
    </Link>
  );
}
