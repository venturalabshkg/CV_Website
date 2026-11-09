"use client";

import { useMemo, useState } from "react";
import type { ContributionGraph } from "@/lib/github";

function level(count: number) {
  if (count <= 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
}

function monthLabel(date: string) {
  const [year, month] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en", { month: "short" }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function GithubGraph({ graph }: { graph: ContributionGraph | null }) {
  const [tip, setTip] = useState<{ label: string; x: number; y: number } | null>(null);

  const weeks = useMemo(() => {
    const days = graph?.days ?? [];
    if (days.length === 0) {
      const empty: { date: string; count: number }[][] = [];
      const cursor = new Date();
      cursor.setUTCDate(cursor.getUTCDate() - cursor.getUTCDay() - 7 * 51);
      for (let week = 0; week < 52; week += 1) {
        const column = [];
        for (let day = 0; day < 7; day += 1) {
          column.push({ date: cursor.toISOString().slice(0, 10), count: 0 });
          cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
        empty.push(column);
      }
      return empty;
    }
    const columns: { date: string; count: number }[][] = [];
    for (let index = 0; index < days.length; index += 7) columns.push(days.slice(index, index + 7));
    return columns;
  }, [graph]);

  const months: { label: string; index: number }[] = [];
  weeks.forEach((week, index) => {
    const label = monthLabel(week[0]?.date || "");
    if (index === 0 || label !== months[months.length - 1]?.label) months.push({ label, index });
  });

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="relative mb-2 h-4 font-mono text-[10px] text-muted">
            {months.map((month) => (
              <span key={`${month.label}-${month.index}`} className="absolute" style={{ left: `${(month.index / weeks.length) * 100}%` }}>
                {month.label}
              </span>
            ))}
          </div>
          <div className="flex gap-[3px]" onMouseLeave={() => setTip(null)}>
            {weeks.map((week, weekIndex) => (
              <div key={week[0]?.date || weekIndex} className="flex flex-1 flex-col gap-[3px]">
                {week.map((day) => (
                  <button
                    key={day.date}
                    type="button"
                    className={`aspect-square w-full contrib-${level(day.count)}`}
                    aria-label={`${day.count} contributions on ${day.date}`}
                    onMouseEnter={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      setTip({
                        label: `${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                    onFocus={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      setTip({
                        label: `${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {tip && (
        <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[calc(100%+8px)] border border-line bg-elevated px-2 py-1 font-mono text-[11px]" style={{ left: tip.x, top: tip.y }}>
          {tip.label}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-muted">
        <p>
          {graph?.source === "github"
            ? `${graph.total.toLocaleString()} contributions, ${graph.from} – ${graph.to}. Source: GitHub.`
            : graph?.message || "Add a GitHub username in the admin profile to show contribution activity."}
        </p>
        <p className="flex items-center gap-1">
          Less
          {[0, 1, 2, 3, 4].map((value) => (
            <span key={value} className={`inline-block size-2.5 contrib-${value}`} />
          ))}
          More
        </p>
      </div>
    </div>
  );
}
