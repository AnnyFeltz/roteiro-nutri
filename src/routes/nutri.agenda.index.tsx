import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { buildEvents, sameDay, formatBR } from "@/lib/agenda-utils";
import { CalendarDays, Clock } from "lucide-react";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/nutri/agenda/")({
  head: () => ({ meta: [{ title: "Agenda — Roteiro Nutri" }] }),
  component: AgendaCalendar,
});

function AgendaCalendar() {
  const { patients } = useStore();
  const nav = useNavigate();
  const events = useMemo(() => buildEvents(patients), [patients]);
  const eventDates = useMemo(() => events.map((e) => e.date), [events]);

  const today = new Date();
  const [month, setMonth] = useState<Date>(today);

  const upcoming = useMemo(() => {
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return events
      .filter((e) => e.date >= t)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 6);
  }, [events]);

  const monthCount = events.filter(
    (e) => e.date.getMonth() === month.getMonth() && e.date.getFullYear() === month.getFullYear()
  ).length;

  function handleSelect(d: Date | undefined) {
    if (!d) return;
    nav({
      to: "/nutri/agenda/$year/$month/$day",
      params: {
        year: String(d.getFullYear()),
        month: String(d.getMonth() + 1).padStart(2, "0"),
        day: String(d.getDate()).padStart(2, "0"),
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-3">
            <CalendarDays className="h-7 w-7 text-primary" /> Agenda
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize as consultas marcadas. Clique em um dia para ver os detalhes.
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {monthCount} consulta{monthCount === 1 ? "" : "s"} este mês
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 lg:col-span-2 bg-card border-border">
          <Calendar
            mode="single"
            locale={ptBR}
            month={month}
            onMonthChange={setMonth}
            onSelect={handleSelect}
            modifiers={{ hasEvent: eventDates }}
            modifiersClassNames={{
              hasEvent:
                "relative font-semibold text-primary after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary",
            }}
            className="w-full pointer-events-auto [--cell-size:2.75rem]"
          />
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground border-t border-border pt-3">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary inline-block" /> Dia com consulta
            </span>
            <span>Clique em qualquer dia para ver as consultas</span>
          </div>
        </Card>

        <Card className="p-5 bg-card border-border">
          <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Próximas consultas
          </h3>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma consulta agendada.</p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((e, i) => (
                <li key={i}>
                  <Link
                    to="/nutri/agenda/$year/$month/$day"
                    params={{
                      year: String(e.date.getFullYear()),
                      month: String(e.date.getMonth() + 1).padStart(2, "0"),
                      day: String(e.date.getDate()).padStart(2, "0"),
                    }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                      style={{ background: e.avatarColor }}
                    >
                      {e.patientName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{e.patientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBR(e.date)}
                        {e.time ? ` • ${e.time}` : ""} • {e.type}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
