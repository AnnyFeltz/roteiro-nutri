import type { Patient } from "./mock-store";

export interface AgendaEvent {
  date: Date;
  patientId: string;
  patientName: string;
  avatarColor: string;
  type: string;
  notes?: string;
  time?: string;
  source: "consultation" | "next" | "last";
}

/** Parse a "DD/MM/YYYY" string into a Date (local). Returns null when invalid. */
export function parseBR(date: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date.trim());
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return isNaN(d.getTime()) ? null : d;
}

export function formatBR(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

export function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function buildEvents(patients: Patient[]): AgendaEvent[] {
  const out: AgendaEvent[] = [];
  for (const p of patients) {
    for (const c of p.consultations ?? []) {
      const d = parseBR(c.date);
      if (!d) continue;
      out.push({
        date: d,
        patientId: p.id,
        patientName: p.name,
        avatarColor: p.avatarColor,
        type: c.type,
        notes: c.notes,
        source: "consultation",
      });
    }
    if (p.active && p.nextConsult) {
      const d = parseBR(p.nextConsult);
      if (d) {
        out.push({
          date: d,
          patientId: p.id,
          patientName: p.name,
          avatarColor: p.avatarColor,
          type: p.status,
          time: p.todayTime,
          source: "next",
        });
      }
    }
  }
  return out;
}
