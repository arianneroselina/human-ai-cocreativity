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
      <span className="text-sm text-gray-700">{label}</span>
      <div className="text-[11px] text-gray-500">{value ?? "—"}</div>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-gray-500">{left}</span>
      <div className="flex-1 grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v as Likert)}
            aria-pressed={value === v}
            className={[
              "h-9 rounded-md border text-sm",
              value === v
                ? "border-black bg-black text-white"
                : "border-gray-300 hover:bg-gray-50",
            ].join(" ")}
          >
            {v}
          </button>
        ))}
      </div>
      <span className="text-[11px] text-gray-500">{right}</span>
    </div>
  </div>
 );
}
