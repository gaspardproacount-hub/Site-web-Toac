"use client";

// Bouton "Ajouter à mon agenda" : propose les principaux outils (Google
// Calendar, Outlook, Yahoo) via un lien direct, et un fichier .ics
// téléchargeable pour Apple Calendar / Outlook de bureau / tout le reste.
// Aucune dépendance externe : les liens sont construits à la main, comme le
// font la plupart des sites d'événements.

import { useEffect, useRef, useState } from "react";

type AddToCalendarButtonProps = {
  title: string;
  description: string;
  location: string;
  /** Date de début, format "YYYYMMDD" (évènement sur journée(s) entières). */
  startDate: string;
  /** Date de fin, format "YYYYMMDD", INCLUSE (dernier jour de l'évènement). */
  endDate: string;
  className?: string;
};

function addDays(yyyymmdd: string, days: number): string {
  const year = Number(yyyymmdd.slice(0, 4));
  const month = Number(yyyymmdd.slice(4, 6)) - 1;
  const day = Number(yyyymmdd.slice(6, 8));
  const d = new Date(Date.UTC(year, month, day));
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

export default function AddToCalendarButton({
  title,
  description,
  location,
  startDate,
  endDate,
  className = "",
}: AddToCalendarButtonProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toutes les dates "fin" attendues par ces outils sont exclusives : on
  // ajoute un jour à la dernière journée de l'évènement.
  const endExclusive = addDays(endDate, 1);

  const googleUrl =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${startDate}/${endExclusive}` +
    `&details=${encodeURIComponent(description)}` +
    `&location=${encodeURIComponent(location)}`;

  const outlookUrl =
    "https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent" +
    `&startdt=${startDate}` +
    `&enddt=${endExclusive}` +
    "&allday=true" +
    `&subject=${encodeURIComponent(title)}` +
    `&body=${encodeURIComponent(description)}` +
    `&location=${encodeURIComponent(location)}`;

  const yahooUrl =
    "https://calendar.yahoo.com/?v=60&view=d&type=20" +
    `&title=${encodeURIComponent(title)}` +
    `&st=${startDate}` +
    `&et=${endExclusive}` +
    "&dur=allday" +
    `&desc=${encodeURIComponent(description)}` +
    `&in_loc=${encodeURIComponent(location)}`;

  function downloadIcs() {
    const escapeIcs = (text: string) =>
      text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
    const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//TOAC Triathlon//Triathlons du Lauragais//FR",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${startDate}-triathlons-du-lauragais@toac-triathlon.com`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${startDate}`,
      `DTEND;VALUE=DATE:${endExclusive}`,
      `SUMMARY:${escapeIcs(title)}`,
      `DESCRIPTION:${escapeIcs(description)}`,
      `LOCATION:${escapeIcs(location)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "triathlons-du-lauragais.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setOpen(false);
  }

  const menuLinkClassName = "block px-4 py-2 text-sm text-toac-blue-950 hover:bg-toac-pink-300/10";

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="rounded-md bg-toac-pink-500 px-6 py-3 font-display text-sm uppercase tracking-wide text-white transition hover:bg-toac-pink-400"
      >
        Ajouter à mon agenda
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-md border border-toac-gray-200 bg-white text-left shadow-lg">
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={menuLinkClassName}
            onClick={() => setOpen(false)}
          >
            Google Calendar
          </a>
          <a
            href={outlookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={menuLinkClassName}
            onClick={() => setOpen(false)}
          >
            Outlook
          </a>
          <a
            href={yahooUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={menuLinkClassName}
            onClick={() => setOpen(false)}
          >
            Yahoo Calendar
          </a>
          <button type="button" onClick={downloadIcs} className={`w-full text-left ${menuLinkClassName}`}>
            Apple Calendar / autre (.ics)
          </button>
        </div>
      )}
    </div>
  );
}
