export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-[22px] font-semibold text-foreground mb-1">{title}</h1>
      <p className="text-[13px] text-muted-foreground mb-8">{description}</p>
      <div className="rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-[13.5px] text-muted-foreground">Not built yet — ask to have this section built next.</p>
      </div>
    </div>
  );
}
