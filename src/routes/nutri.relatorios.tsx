import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Users, Apple, TrendingDown, TrendingUp, CalendarDays, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { useMemo } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/nutri/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — Roteiro Nutri" }] }),
  component: Relatorios,
});

function Relatorios() {
  const { patients, plans } = useStore();

  const data = useMemo(() => {
    const active = patients.filter((p) => p.active);
    const totalLost = active.reduce((s, p) => s + Math.max(0, p.initialWeightKg - p.weightKg), 0);
    const totalGained = active.reduce((s, p) => s + Math.max(0, p.weightKg - p.initialWeightKg), 0);
    const activePlans = plans.filter((p) => p.active).length;
    const avgKcal = activePlans
      ? Math.round(plans.filter((p) => p.active).reduce((s, p) => s + p.targetKcal, 0) / activePlans)
      : 0;

    const goals: Record<string, number> = {};
    active.forEach((p) => { goals[p.goal] = (goals[p.goal] ?? 0) + 1; });
    const goalData = Object.entries(goals).map(([name, value]) => ({ name, value }));

    const byPatient = active.map((p) => ({
      name: p.name.split(" ")[0],
      perdido: Math.max(0, +(p.initialWeightKg - p.weightKg).toFixed(1)),
      ganho: Math.max(0, +(p.weightKg - p.initialWeightKg).toFixed(1)),
    }));

    return { active, totalLost, totalGained, activePlans, avgKcal, goalData, byPatient };
  }, [patients, plans]);

  const GOAL_COLORS = ["var(--primary)", "var(--terracotta)", "var(--chart-3)", "var(--leaf)", "var(--chart-4)"];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-display font-semibold">Relatórios</h1>
          <p className="text-muted-foreground mt-1">Visão consolidada do consultório (RF13).</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => { window.print(); toast.success("Use 'Salvar como PDF' no diálogo de impressão"); }}>
          <Download className="h-4 w-4" /> Exportar PDF
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Users} label="Pacientes ativos" value={data.active.length} tone="leaf" />
        <Stat icon={Apple} label="Planos ativos" value={data.activePlans} tone="default" />
        <Stat icon={TrendingDown} label="Peso perdido (total)" value={`${data.totalLost.toFixed(1)} kg`} tone="leaf" />
        <Stat icon={Target} label="kcal médio/plano" value={data.avgKcal || "—"} tone="terracotta" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 bg-card border-border lg:col-span-2">
          <h3 className="font-display font-semibold text-lg mb-1">Evolução de peso por paciente</h3>
          <p className="text-xs text-muted-foreground mb-4">Diferença entre peso inicial e atual (kg)</p>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={data.byPatient} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="perdido" name="Peso perdido" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="ganho" name="Peso ganho" fill="var(--terracotta)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 bg-card border-border">
          <h3 className="font-display font-semibold text-lg mb-1">Objetivos</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribuição dos pacientes ativos</p>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.goalData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={(e) => `${e.name}`}>
                  {data.goalData.map((_, i) => <Cell key={i} fill={GOAL_COLORS[i % GOAL_COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1.5 text-xs">
            {data.goalData.map((g, i) => (
              <li key={g.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 capitalize">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: GOAL_COLORS[i % GOAL_COLORS.length] }} />
                  {g.name}
                </span>
                <span className="font-medium">{g.value}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-5 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold text-lg">Relatórios individuais</h3>
        </div>
        <ul className="divide-y divide-border">
          {data.active.map((p) => {
            const diff = +(p.weightKg - p.initialWeightKg).toFixed(1);
            const toGoal = +(p.weightKg - p.targetWeightKg).toFixed(1);
            const Icon = diff < 0 ? TrendingDown : TrendingUp;
            return (
              <li key={p.id} className="py-3 flex flex-wrap items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0" style={{ background: p.avatarColor }}>
                  {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{p.goal} · {p.initialWeightKg}kg → {p.weightKg}kg · meta {p.targetWeightKg}kg</p>
                </div>
                <Badge variant="outline" className={diff < 0 ? "border-leaf text-leaf gap-1" : "border-terracotta text-terracotta gap-1"}>
                  <Icon className="h-3 w-3" /> {Math.abs(diff)} kg
                </Badge>
                <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" /> Próx: {p.nextConsult}
                </span>
                <Badge variant="secondary" className="text-xs">{Math.abs(toGoal)} kg da meta</Badge>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string | number; tone: "default" | "leaf" | "terracotta" }) {
  const cls = tone === "leaf" ? "bg-primary/10 text-primary" : tone === "terracotta" ? "bg-terracotta/10 text-terracotta" : "bg-muted text-muted-foreground";
  return (
    <Card className="p-4 sm:p-5 bg-card border-border">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${cls} mb-3`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl sm:text-3xl font-display font-semibold mt-1">{value}</p>
    </Card>
  );
}
