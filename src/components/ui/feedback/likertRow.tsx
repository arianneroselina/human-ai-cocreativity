"use client";

export type Likert = 1 | 2 | 3 | 4 | 5;

type LikertRowProps = {
  label: string;
  value: Likert | null;
  onChange: (v: Likert) => void;
  left?: string;
  right?: string;
};

export default function LikertRow({
  label,
  value,
  onChange,
  left = "Very low",
  right = "Very high",
}: LikertRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">{label}</span>
        <div className="text-[11px] text-muted-foreground">{value ?? "—"}</div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-muted-foreground">{left}</span>

        <div className="flex-1 grid grid-cols-5 gap-2" role="radiogroup" aria-label={label}>
          {[1, 2, 3, 4, 5].map((v) => {
            const active = value === (v as Likert);
            return (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange(v as Likert)}
                className={[
                  "h-9 rounded-md border text-sm transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-accent",
                ].join(" ")}
                title={`Select ${v}`}
              >
                {v}
              </button>
            );
          })}
        </div>

        <span className="text-[11px] text-muted-foreground">{right}</span>
      </div>
    </div>
  );
}
