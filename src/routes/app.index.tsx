import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { Bell, Timer, Leaf, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Início — Roteiro Nutri" }] }),
  component: Home,
});

function Home() {
  const { session, getPatient, getActivePlan } = useStore();
  const p = session.patientId ? getPatient(session.patientId) : undefined;
  if (!p) return null;
  const plan = getActivePlan(p.id);
  const total = plan?.meals.length ?? 0;
  const done = plan?.adherenceLog.today?.length ?? 0;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const next = plan?.meals.find((m) => !plan.adherenceLog.today?.includes(m.id));

  const adherence = [
    { name: "ok", value: pct, color: "var(--primary)" },
    { name: "rest", value: 100 - pct, color: "var(--muted)" },
  ];

  return (
    <div className="px-5 pt-6 space-y-5">
      <div className="flex items-center justify-between">
        <Logo className="h-8" />
        <button className="relative p-2"><Bell className="h-5 w-5 text-foreground/70" /><span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-terracotta" /></button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold">Olá, {p.name.split(" ")[0]}! 👋</h1>
        <p className="text-sm text-muted-foreground">Vamos para mais um dia de conquistas.</p>
      </div>

      {next && (
        <Card className="p-5 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Timer className="h-6 w-6" /></div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Próxima refeição</p>
              <p className="font-display font-semibold text-lg">{next.name}</p>
            </div>
            <p className="text-xl font-mono text-primary">{next.time}</p>
          </div>
        </Card>
      )}

      <Card className="p-5 bg-card border-border">
        <p className="text-sm font-medium mb-3">Progresso do dia</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-background p-3 text-center">
            <p className="text-xs text-muted-foreground">Refeições</p>
            <p className="text-xl font-display font-semibold">{done}/{total}</p>
          </div>
          <div className="rounded-xl bg-background p-3 text-center">
            <p className="text-xs text-muted-foreground">Check-ins</p>
            <p className="text-xl font-display font-semibold">{done}/{total}</p>
          </div>
        </div>
      </Card>

      <Card className="p-5 bg-card border-border">
        <p className="text-sm font-medium">Adesão semanal</p>
        <div className="flex items-center gap-4 mt-2">
          <div className="relative h-24 w-24">
            <ResponsiveContainer><PieChart>
              <Pie data={adherence} dataKey="value" innerRadius={28} outerRadius={42} startAngle={90} endAngle={-270}>
                {adherence.map((a, i) => <Cell key={i} fill={a.color} />)}
              </Pie>
            </PieChart></ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-primary">{pct}%</div>
          </div>
          <div>
            <p className="font-display font-semibold text-xl flex items-center gap-1">Ótima! <Leaf className="h-5 w-5 text-leaf" /></p>
            <p className="text-xs text-muted-foreground">Você está indo muito bem!</p>
          </div>
        </div>
      </Card>

      <Link to="/app/plano" className="block">
        <Card className="p-4 bg-primary text-primary-foreground border-0 flex items-center justify-between">
          <span className="font-medium">Ver plano do dia</span>
          <ChevronRight className="h-5 w-5" />
        </Card>
      </Link>
    </div>
  );
}
