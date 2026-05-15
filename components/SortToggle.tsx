"use client";

export type SortMode = "published" | "random";

type SortToggleProps = {
  value: SortMode;
  onChange: (value: SortMode) => void;
};

export function SortToggle({ value, onChange }: SortToggleProps) {
  return (
    <div className="inline-flex border-2 border-ink bg-bone text-sm font-black text-muted shadow-[3px_3px_0_#21180f]">
      <button
        type="button"
        onClick={() => onChange("published")}
        className={`px-4 py-2 transition ${
          value === "published" ? "bg-[#ff5e8f] text-ink" : "hover:bg-[#57d4c4] hover:text-ink"
        }`}
      >
        新しい順
      </button>
      <button
        type="button"
        onClick={() => onChange("random")}
        className={`border-l-2 border-ink px-4 py-2 transition ${
          value === "random" ? "bg-[#ff5e8f] text-ink" : "hover:bg-[#57d4c4] hover:text-ink"
        }`}
      >
        ランダム
      </button>
    </div>
  );
}
