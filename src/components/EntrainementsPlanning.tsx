"use client";

import { useMemo, useState } from "react";
import {
  DISCIPLINE_LABELS,
  DISCIPLINE_COLORS,
  DISCIPLINE_SHORT_LABELS,
  DISCIPLINE_TOOLTIPS,
  JOURS_ORDER,
  type Discipline,
} from "@/content/planning";

export type PlanningSession = {
  id: string;
  jour: string;
  startMinutes: number;
  endMinutes: number;
  hasEndTime: boolean;
  sport: string;
  lieu: string;
  coach: string;
  notes: string;
};

const DEFAULT_COLOR = "bg-toac-gray-100 text-toac-blue-900 border-toac-gray-200";

function isDiscipline(sport: string): sport is Discipline {
  return sport in DISCIPLINE_LABELS;
}

function sportLabel(sport: string): string {
  return isDiscipline(sport) ? DISCIPLINE_LABELS[sport] : sport;
}

function sportShortLabel(sport: string): string {
  return isDiscipline(sport) ? DISCIPLINE_SHORT_LABELS[sport] : sport;
}

function sportColor(sport: string): string {
  return isDiscipline(sport) ? DISCIPLINE_COLORS[sport] : DEFAULT_COLOR;
}

function formatHour(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

function assignLanes(sessions: PlanningSession[]): Map<string, number> {
  const sorted = [...sessions].sort((a, b) => a.startMinutes - b.startMinutes);
  const laneEnds: number[] = [];
  const lanes = new Map<string, number>();
  for (const s of sorted) {
    let lane = laneEnds.findIndex((end) => end <= s.startMinutes);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(s.endMinutes);
    } else {
      laneEnds[lane] = s.endMinutes;
    }
    lanes.set(s.id, lane);
  }
  return lanes;
}

export default function EntrainementsPlanning({ sessions }: { sessions: PlanningSession[] }) {
  const sportsPresent = useMemo(() => {
    const order: Discipline[] = ["natation", "course", "velo", "muscu"];
    const known = order.filter((d) => sessions.some((s) => s.sport === d));
    const unknown = Array.from(new Set(sessions.map((s) => s.sport))).filter((s) => !isDiscipline(s));
    return [...known, ...unknown];
  }, [sessions]);

  const [selected, setSelected] = useState<Set<string>>(() => new Set(sportsPresent));

  function toggle(sport: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(sport)) next.delete(sport);
      else next.add(sport);
      return next;
    });
  }

  const filtered = sessions.filter((s) => selected.has(s.sport));

  const jours = JOURS_ORDER.filter((j) => sessions.some((s) => s.jour === j));

  const { rangeStart, rangeEnd } = useMemo(() => {
    if (sessions.length === 0) return { rangeStart: 7 * 60, rangeEnd: 22 * 60 };
    const starts = sessions.map((s) => s.startMinutes);
    const ends = sessions.map((s) => s.endMinutes);
    const min = Math.floor(Math.min(...starts) / 60) * 60;
    const max = Math.ceil(Math.max(...ends) / 60) * 60;
    return { rangeStart: min, rangeEnd: Math.max(max, min + 60) };
  }, [sessions]);

  const totalMinutes = rangeEnd - rangeStart;
  const hourTicks: number[] = [];
  for (let m = rangeStart; m <= rangeEnd; m += 60) hourTicks.push(m);

  const joursParJour = jours.map((jour) => ({
    jour,
    sessions: filtered
      .filter((s) => s.jour === jour)
      .sort((a, b) => a.startMinutes - b.startMinutes),
  }));

  return (
    <div>
      <div className="mt-8 flex flex-wrap gap-3 text-xs">
        {sportsPresent.map((sport) => {
          const active = selected.has(sport);
          const tooltip = isDiscipline(sport) ? DISCIPLINE_TOOLTIPS[sport] : undefined;
          return (
            <label
              key={sport}
              title={tooltip}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 font-medium transition ${
                active ? sportColor(sport) : "border-toac-gray-200 bg-white text-toac-blue-900/40"
              }`}
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() => toggle(sport)}
                className="h-3 w-3 accent-toac-blue-900"
              />
              {sportLabel(sport)}
              {tooltip && (
                <span
                  aria-hidden="true"
                  className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-current text-[9px] leading-none"
                >
                  i
                </span>
              )}
            </label>
          );
        })}
      </div>

      {jours.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
          <div style={{ minWidth: `${Math.max(hourTicks.length * 64, 480)}px` }}>
            <div className="relative ml-20 mb-2 h-4 text-[11px] text-toac-blue-900/60">
              {hourTicks.map((m) => (
                <span
                  key={m}
                  className="absolute -translate-x-1/2"
                  style={{ left: `${((m - rangeStart) / totalMinutes) * 100}%` }}
                >
                  {formatHour(m)}
                </span>
              ))}
            </div>
            {joursParJour.map(({ jour, sessions: daySessions }) => {
              const lanes = assignLanes(daySessions);
              const laneCount = Math.max(1, ...Array.from(lanes.values(), (v) => v + 1));
              const laneHeight = 30;
              return (
                <div key={jour} className="mb-2 flex items-stretch">
                  <div className="w-20 shrink-0 pr-2 text-xs font-medium text-toac-blue-950">{jour}</div>
                  <div
                    className="relative flex-1 rounded border border-toac-gray-100 bg-toac-gray-50/50"
                    style={{ height: `${laneCount * laneHeight + 4}px` }}
                  >
                    {hourTicks.map((m) => (
                      <div
                        key={m}
                        className="absolute top-0 h-full border-l border-toac-gray-100"
                        style={{ left: `${((m - rangeStart) / totalMinutes) * 100}%` }}
                      />
                    ))}
                    {daySessions.map((s) => {
                      const lane = lanes.get(s.id) ?? 0;
                      const left = ((s.startMinutes - rangeStart) / totalMinutes) * 100;
                      const width = ((s.endMinutes - s.startMinutes) / totalMinutes) * 100;
                      return (
                        <div
                          key={s.id}
                          title={`${sportLabel(s.sport)} · ${formatHour(s.startMinutes)}${
                            s.hasEndTime ? `–${formatHour(s.endMinutes)}` : ""
                          }${s.lieu ? ` · ${s.lieu}` : ""}`}
                          className={`absolute overflow-hidden rounded border px-1.5 text-[10px] font-medium leading-tight ${sportColor(
                            s.sport
                          )}`}
                          style={{
                            left: `${left}%`,
                            width: `calc(${width}% - 2px)`,
                            top: `${lane * laneHeight + 2}px`,
                            height: `${laneHeight - 4}px`,
                          }}
                        >
                          <span className="block truncate">
                            {formatHour(s.startMinutes)} {sportShortLabel(s.sport)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {joursParJour
          .filter((g) => g.sessions.length > 0)
          .map((g) => (
            <div key={g.jour} className="rounded-lg border border-toac-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg uppercase text-toac-blue-950">{g.jour}</h2>
              <ul className="mt-3 space-y-3">
                {g.sessions.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-col gap-1 border-b border-toac-gray-100 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-toac-blue-950">
                        {formatHour(s.startMinutes)}
                        {s.hasEndTime ? `–${formatHour(s.endMinutes)}` : ""}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${sportColor(s.sport)}`}>
                        {sportLabel(s.sport)}
                      </span>
                    </div>
                    {s.lieu && <span className="text-sm text-toac-blue-900/80">{s.lieu}</span>}
                    {s.coach && <span className="text-xs text-toac-blue-900/60">Coach : {s.coach}</span>}
                    {s.notes && <span className="text-xs text-toac-blue-900/60">{s.notes}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
}
