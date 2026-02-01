"use client";

export function TlxRow({
                  title,
                  question,
                  value,
                  onChange,
                  left,
                  right,
                }: {
  title: string;
  question: string;
  value: number | null;
  onChange: (v: number) => void;
  left: string;
  right: string;
}) {
  return (
    <div className="space-y-3 w-full">
      <div className="text-sm font-medium text-foreground">{title}</div>
      <div className="text-sm text-muted-foreground">{question}</div>

      <div className="grid grid-cols-21 gap-1 w-full">
        {Array.from({ length: 21 }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={`
              h-6 rounded-sm transition
              ${value === i ? "bg-primary" : "bg-border"}
              hover:bg-primary/60
            `}
            aria-label={`${title} ${i}`}
          />
        ))}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}