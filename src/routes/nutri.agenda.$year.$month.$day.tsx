import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buildEvents, sameDay } from "@/lib/agenda-utils";
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, User } from "lucide-react";

export const Route = createFileRoute("/nutri/agenda/$year/$month/$day")({
  head: () => ({ meta: [{ title: "Consultas do dia — Roteiro Nutri" }] }),
  component: AgendaDay,
});

const WD = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const MO = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function AgendaDay() {
  const { year, month, day } = Route.useParams();
  const { patients } = useStore();
  const nav = useNavigate();

  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const valid = !isNaN(date.getTime());

  const events = useMemo(() => buildEvents(patients), [patients]);
  const dayEvents = useMemo(
    () =>
      valid
        ? events
            .filter((e) => sameDay(e.date, date))
            .sort((a, b) => (a.time ?? "99").localeCompare(b.time ?? "99"))
        : [],
    [events, valid, date]
  );

  function shift(days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    nav({
      to: "/nutri/agenda/$year/$month/$day",
      params: {
        year: String(d.getFullYear()),
        month: String(d.getMonth() + 1).padStart(2, "0"),
        day: String(d.getDate()).padStart(2, "0"),
      },
    });
  }

  if (!valid) {
    return (
      <div className="space-y-4">
        <Link to="/nutri/agenda" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Voltar para a agenda
        </Link>
        <p className="text-muted-foreground">Data inválida.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/nutri/agenda"
          className="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para o calendário
        </Link>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold flex items-center gap-3">
              <CalendarDays className="h-7 w-7 text-primary" />
              {date.getDate()} de {MO[date.getMonth()]} de {date.getFullYear()}
            </h1>
            <p className="text-muted-foreground mt-1 capitalize">{WD[date.getDay()]}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => shift(-1)}>
              <ChevronLeft className="h-4 w-4" /> Dia anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => shift(1)}>
              Próximo dia <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {dayEvents.length === 0 ? (
        <Card className="p-10 text-center bg-card border-border">
          <p className="text-muted-foreground">Nenhuma consulta marcada para este dia.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {dayEvents.map((e, i) => (
            <Card key={i} className="p-5 bg-card border-border flex items-center gap-4">
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold shrink-0"
                style={{ background: e.avatarColor }}
              >
                {e.patientName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{e.patientName}</h3>
                  <Badge variant="outline" className="text-xs">{e.type}</Badge>
                  {e.source === "next" && (
                    <Badge className="text-xs bg-primary/15 text-primary border-0">Agendada</Badge>
                  )}
                  {e.source === "consultation" && (
                    <Badge className="text-xs bg-muted text-muted-foreground border-0">Realizada</Badge>
                  )}
                </div>
                {e.time && <p className="text-xs text-muted-foreground mt-0.5">Horário: {e.time}</p>}
                {e.notes && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{e.notes}</p>}
              </div>
              <Link to="/nutri/pacientes/$id" params={{ id: e.patientId }}>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4" /> Ver paciente
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
