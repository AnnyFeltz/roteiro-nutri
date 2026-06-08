import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";

export const Route = createFileRoute("/nutri/evolucao")({
  head: () => ({ meta: [{ title: "Evolução — Roteiro Nutri" }] }),
  component: EvolucaoPage,
});

const COLORS = [
  "var(--leaf)", "var(--terracotta)", "var(--chart-3)",
  "var(--chart-4)", "var(--chart-5)", "var(--primary)",
];

function deltaIcon(delta: number) {
  if (delta < -0.1) return { Icon: TrendingDown, color: "text-leaf" };
  if (delta > 0.1) return { Icon: TrendingUp, color: "text-terracotta" };
  return { Icon: Minus, color: "text-muted-foreground" };
}

function EvolucaoPage() {
  const { patients } = useStore();
  const active = patients.filter((p) => p.active);
  const [selected, setSelected] = useState<string[]>(active.slice(0, 3).map((p) => p.id));

  const months = active[0]?.evolution.map((e) => e.month) ?? [];

  const chartData = useMemo(() => {
    return months.map((m, i) => {
      const row: Record<string, number | string> = { month: m };
      for (const p of active) {
        if (selected.includes(p.id)) row[p.name] = p.evolution[i]?.weight ?? 0;
      }
      return row;
    });
  }, [months, active, selected]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  // Aggregate metrics
  const totalLost = active.reduce((acc, p) => acc + Math.max(0, p.initialWeightKg - p.weightKg), 0);
  const totalGained = active.reduce((acc, p) => acc + Math.max(0, p.weightKg - p.initialWeightKg), 0);
  const goalReached = active.filter((p) => {
    const dir = p.targetWeightKg < p.initialWeightKg ? -1 : 1;
    const progress = (p.weightKg - p.initialWeightKg) * dir;
    const total = (p.targetWeightKg - p.initialWeightKg) * dir;
    return total > 0 && progress / total >= 0.9;
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-3">
          <TrendingUp className="h-7 w-7 text-primary" /> Evolução dos pacientes
        </h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe o progresso de peso e metas de todos os pacientes ativos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-card border-border">
          <p className="text-xs text-muted-foreground">Total perdido (kg)</p>
          <p className="text-3xl font-display font-semibold text-leaf mt-1">
            -{totalLost.toFixed(1)}
          </p>
        </Card>
        <Card className="p-5 bg-card border-border">
          <p className="text-xs text-muted-foreground">Total ganho (kg)</p>
          <p className="text-3xl font-display font-semibold text-terracotta mt-1">
            +{totalGained.toFixed(1)}
          </p>
        </Card>
        <Card className="p-5 bg-card border-border">
          <p className="text-xs text-muted-foreground">Próximos da meta (≥90%)</p>
          <p className="text-3xl font-display font-semibold text-primary mt-1 flex items-center gap-2">
            <Target className="h-6 w-6" /> {goalReached}/{active.length}
          </p>
        </Card>
      </div>

      <Card className="p-5 bg-card border-border">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-display font-semibold text-lg">Evolução de peso (kg)</h3>
          <p className="text-xs text-muted-foreground">Clique nos pacientes abaixo para comparar</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {active
                .filter((p) => selected.includes(p.id))
                .map((p, i) => (
                  <Line
                    key={p.id}
                    type="monotone"
                    dataKey={p.name}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5 bg-card border-border">
        <h3 className="font-display font-semibold text-lg mb-4">Progresso por paciente</h3>
        <div className="space-y-3">
          {active.map((p) => {
            const dir = p.targetWeightKg < p.initialWeightKg ? -1 : 1;
            const goalDelta = (p.targetWeightKg - p.initialWeightKg) * dir;
            const actualDelta = (p.weightKg - p.initialWeightKg) * dir;
            const pct = goalDelta > 0 ? Math.max(0, Math.min(100, (actualDelta / goalDelta) * 100)) : 0;
            const monthlyDelta = p.weightKg - p.initialWeightKg;
            const { Icon, color } = deltaIcon(monthlyDelta);
            const isSelected = selected.includes(p.id);

            return (
              <div
                key={p.id}
                className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                  isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent/40"
                }`}
                onClick={() => toggle(p.id)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                    style={{ background: p.avatarColor }}
                  >
                    {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to="/nutri/pacientes/$id"
                        params={{ id: p.id }}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium hover:text-primary"
                      >
                        {p.name}
                      </Link>
                      <Badge variant="outline" className="text-xs capitalize">{p.goal}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>Inicial: <b className="text-foreground">{p.initialWeightKg}kg</b></span>
                      <span>Atual: <b className="text-foreground">{p.weightKg}kg</b></span>
                      <span>Meta: <b className="text-foreground">{p.targetWeightKg}kg</b></span>
                      <span className={`flex items-center gap-1 ${color}`}>
                        <Icon className="h-3 w-3" /> {monthlyDelta > 0 ? "+" : ""}{monthlyDelta.toFixed(1)}kg
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-display font-semibold text-primary">{pct.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">da meta</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
