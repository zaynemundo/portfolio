export function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-[14px] text-zinc-500 py-12 text-center border border-dashed border-zinc-800 rounded-xl">
      {message}
    </p>
  );
}
