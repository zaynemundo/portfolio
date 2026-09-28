export function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-[14px] text-muted-foreground py-12 text-center border border-dashed border-border rounded-xl">
      {message}
    </p>
  );
}
