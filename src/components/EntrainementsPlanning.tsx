"use client";

import Link from "next/link";
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
  rdvMinutes: number;
  sport: string;
  lieu: string;
  lieuHref: string | null;
  coach: string;
  notes: string;
};

export type SportRequirement = { requirements: string; imageUrl: string | null };

const END_TIME_TOOLTIP =
  "Vous pouvez quitter la séance à l'heure de votre choix après avoir prévenu l'encadrant.";

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

export default function EntrainementsPlanning({
  sessions,
  sportRequirements = {},
}: {
  sessions: PlanningSession[];
  sportRequirements?: Record<string, SportRequirement>;
}) {
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

  const hourTicks: number[] = [];
  for (let m = rangeStart; m <= rangeEnd; m += 60) hourTicks.push(m);

  // Les heures sans aucun créneau (sur aucun jour) sont compressées plutôt
  // que masquées : elles restent visibles (repère horaire continu) mais
  // n'occupent qu'une fraction de la largeur d'une heure normale.
  const COMPRESSED_HOUR_WEIGHT = 0.25;
  const hourWeights = hourTicks.slice(0, -1).map((start, i) => {
    const end = hourTicks[i + 1];
    const occupied = sessions.some((s) => s.startMinutes < end && s.endMinutes > start);
    return occupied ? 1 : COMPRESSED_HOUR_WEIGHT;
  });
  const hourOffsets = [0];
  hourWeights.forEach((w) => hourOffsets.push(hourOffsets[hourOffsets.length - 1] + w));
  const totalWeight = hourOffsets[hourOffsets.length - 1] || 1;

  function toPercent(minutes: number): number {
    const idx = Math.min(hourWeights.length - 1, Math.max(0, Math.floor((minutes - rangeStart) / 60)));
    const bucketStart = rangeStart + idx * 60;
    const frac = Math.min(1, Math.max(0, (minutes - bucketStart) / 60));
    return ((hourOffsets[idx] + frac * hourWeights[idx]) / totalWeight) * 100;
  }

  const PX_PER_HOUR = 64;
  const timelineHeight = Math.max(totalWeight * PX_PER_HOUR, 280);

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
              <span title={tooltip} className={tooltip ? "cursor-help underline decoration-dotted" : undefined}>
                {sportLabel(sport)}
              </span>
            </label>
          );
        })}
      </div>

      {jours.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
          <div style={{ minWidth: `${Math.max(jours.length * 110 + 56, 480)}px` }}>
            <div className="flex">
              <div className="w-14 shrink-0" />
              {jours.map((jour) => (
                <div key={jour} className="flex-1 px-1 text-center text-xs font-medium text-toac-blue-950">
                  {jour}
                </div>
              ))}
            </div>
            <div className="relative mt-2 flex" style={{ height: `${timelineHeight}px` }}>
              <div className="relative w-14 shrink-0">
                {hourTicks.map((m) => (
                  <span
                    key={m}
                    className="absolute -translate-y-1/2 text-[11px] text-toac-blue-900/60"
                    style={{ top: `${toPercent(m)}%` }}
                  >
                    {formatHour(m)}
                  </span>
                ))}
              </div>
              {joursParJour.map(({ jour, sessions: daySessions }) => {
                const lanes = assignLanes(daySessions);
                const laneCount = Math.max(1, ...Array.from(lanes.values(), (v) => v + 1));
                const laneWidth = 100 / laneCount;
                return (
                  <div key={jour} className="relative flex-1 border-l border-toac-gray-100 px-0.5">
                    {hourTicks.map((m) => (
                      <div
                        key={m}
                        className="absolute left-0 right-0 border-t border-toac-gray-100"
                        style={{ top: `${toPercent(m)}%` }}
                      />
                    ))}
                    {daySessions.map((s) => {
                      const lane = lanes.get(s.id) ?? 0;
                      const top = toPercent(s.startMinutes);
                      const height = toPercent(s.endMinutes) - top;
                      return (
                        <div
                          key={s.id}
                          title={`${sportLabel(s.sport)} · ${formatHour(s.startMinutes)}${
                            s.hasEndTime ? `–${formatHour(s.endMinutes)}` : ""
                          }${s.lieu ? ` · ${s.lieu}` : ""}`}
                          className={`absolute overflow-hidden rounded border px-1 text-[10px] font-medium leading-tight ${sportColor(
                            s.sport
                          )}`}
                          style={{
                            top: `${top}%`,
                            height: `calc(${height}% - 2px)`,
                            left: `${lane * laneWidth}%`,
                            width: `calc(${laneWidth}% - 2px)`,
                          }}
                        >
                          <span className="block truncate">
                            {formatHour(s.startMinutes)} {sportShortLabel(s.sport)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
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
                {g.sessions.map((s) => {
                  const req = sportRequirements[s.sport];
                  const hasPrerequisites = Boolean(req?.requirements || s.notes || req?.imageUrl);
                  return (
                    <li
                      key={s.id}
                      className="flex flex-col gap-1 border-b border-toac-gray-100 pb-3 last:border-0 last:pb-0"
                    >
                      <span
                        className={`inline-block w-fit rounded-full border px-2 py-0.5 text-xs font-medium ${sportColor(s.sport)}`}
                      >
                        {sportLabel(s.sport)}
                      </span>
                      <div className="mt-1 space-y-0.5 text-sm text-toac-blue-950">
                        <div>
                          <span className="font-medium">Rdv :</span> {formatHour(s.rdvMinutes)}
                        </div>
                        <div>
                          <span className="font-medium">Début de la séance :</span> {formatHour(s.startMinutes)}
                        </div>
                        {s.hasEndTime && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Fin de la séance :</span> {formatHour(s.endMinutes)}
                            <span
                              title={END_TIME_TOOLTIP}
                              aria-label={END_TIME_TOOLTIP}
                              className="inline-flex h-3.5 w-3.5 shrink-0 cursor-help items-center justify-center rounded-full border border-toac-blue-900/40 text-[9px] leading-none text-toac-blue-900/60"
                            >
                              i
                            </span>
                          </div>
                        )}
                      </div>
                      {s.lieu && (
                        <div className="text-sm text-toac-blue-900/80">
                          <span className="font-medium text-toac-blue-950">Lieu :</span>{" "}
                          {s.lieuHref ? (
                            <Link href={s.lieuHref} className="underline hover:text-toac-blue-950">
                              {s.lieu}
                            </Link>
                          ) : (
                            s.lieu
                          )}
                        </div>
                      )}
                      {s.coach && <span className="text-xs text-toac-blue-900/60">Coach : {s.coach}</span>}
                      {hasPrerequisites &&
                        (s.sport === "velo" ? (
                          <details className="mt-1 rounded-md bg-toac-gray-50 text-xs text-toac-blue-900/70">
                            <summary className="cursor-pointer select-none p-2 font-medium text-toac-blue-900">
                              Prérequis
                            </summary>
                            <div className="px-2 pb-2">
                              {req?.requirements && <p className="mt-1 whitespace-pre-line">{req.requirements}</p>}
                              {s.notes && <p className="mt-1 whitespace-pre-line">{s.notes}</p>}
                              {req?.imageUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={req.imageUrl} alt="" className="mt-2 max-h-32 rounded-md object-contain" />
                              )}
                            </div>
                          </details>
                        ) : (
                          <div className="mt-1 rounded-md bg-toac-gray-50 p-2 text-xs text-toac-blue-900/70">
                            <p className="font-medium text-toac-blue-900">Prérequis</p>
                            {req?.requirements && <p className="mt-1 whitespace-pre-line">{req.requirements}</p>}
                            {s.notes && <p className="mt-1 whitespace-pre-line">{s.notes}</p>}
                            {req?.imageUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={req.imageUrl} alt="" className="mt-2 max-h-32 rounded-md object-contain" />
                            )}
                          </div>
                        ))}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
}
