import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CalendarDays, Apple, TrendingUp, ArrowUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/nutri/")({
  head: () => ({ meta: [{ title: "Dashboard — Roteiro Nutri" }] }),
  component: Dashboard,
});

const ADHERENCE = [
  { name: "Ótima (80-100%)", value: 62, color: "var(--leaf)" },
  { name: "Boa (50-79%)", value: 25, color: "var(--chart-3)" },
  { name: "Regular (20-49%)", value: 10, color: "var(--terracotta)" },
  { name: "Baixa (0-19%)", value: 3, color: "var(--destructive)" },
];

const EVOLUTION = [
  { m: "Jan", v: 30 }, { m: "Fev", v: 42 }, { m: "Mar", v: 55 },
  { m: "Abr", v: 60 }, { m: "Mai", v: 72 }, { m: "Jun", v: 78 },
];

function Dashboard() {
  const { nutritionist, patients, plans } = useStore();
  const activePatients = patients.filter((p) => p.active).length;
  const activePlans = plans.filter((p) => p.active).length;
  const todayConsults = patients.filter((p) => p.active && p.todayTime).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Bem-vinda, {nutritionist.name}! 👋</h1>
        <p className="text-muted-foreground mt-1">Aqui está um resumo do seu consultório.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={Users} label="Pacientes ativos" value={activePatients} delta="+12 este mês" />
        <Kpi icon={CalendarDays} label="Consultas hoje" value={todayConsults.length} delta="próxima às 08:00" tone="terracotta" />
        <Kpi icon={Apple} label="Planos alimentares" value={activePlans} delta="+8 este mês" />
        <Kpi icon={TrendingUp} label="Taxa de adesão" value="92%" delta="+3% vs mês anterior" tone="leaf" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-1 bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">Consultas de hoje</h3>
          </div>
          <ul className="space-y-3">
            {todayConsults.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-mono text-muted-foreground w-12">{p.todayTime}</span>
                  <Link to="/nutri/pacientes/$id" params={{ id: p.id }} className="font-medium text-sm hover:text-primary truncate">{p.name}</Link>
                </div>
                <Badge variant="outline" className={p.status === "Avaliação" ? "border-terracotta text-terracotta" : "border-primary text-primary"}>
                  {p.status}
                </Badge>
              </li>
            ))}
          </ul>
          <Link to="/nutri/agenda" className="block text-center text-sm text-primary hover:underline mt-5 pt-4 border-t border-border">
            Ver agenda completa
          </Link>
        </Card>

        <Card className="p-5 bg-card border-border">
          <h3 className="font-display font-semibold text-lg mb-1">Adesão dos pacientes</h3>
          <p className="text-xs text-muted-foreground mb-2">Últimos 30 dias</p>
          <div className="relative h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={ADHERENCE} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                  {ADHERENCE.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-3xl font-display font-semibold text-primary">92%</p>
              <p className="text-xs text-muted-foreground">Adesão geral</p>
            </div>
          </div>
          <ul className="mt-3 space-y-1.5 text-xs">
            {ADHERENCE.map((a) => (
              <li key={a.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: a.color }} />{a.name}</span>
                <span className="font-medium">{a.value}%</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5 bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">Evolução geral (média)</h3>
            <span className="text-xs text-muted-foreground">Últimos 6 meses</span>
          </div>
          <div className="h-44">
            <ResponsiveContainer>
              <LineChart data={EVOLUTION} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--primary)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 mt-2 border-t border-border">
            <div>
              <p className="text-xl font-display font-semibold text-leaf">-3,2 kg</p>
              <p className="text-xs text-muted-foreground">Peso médio perdido</p>
            </div>
            <div>
              <p className="text-xl font-display font-semibold text-terracotta">+1,8 kg</p>
              <p className="text-xs text-muted-foreground">Massa magra média</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, delta, tone = "default" }: { icon: any; label: string; value: string | number; delta: string; tone?: "default" | "leaf" | "terracotta" }) {
  const toneCls = tone === "leaf" ? "bg-primary/10 text-primary" : tone === "terracotta" ? "bg-terracotta/10 text-terracotta" : "bg-muted text-muted-foreground";
  return (
    <Card className="p-5 bg-card border-border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-4xl font-display font-semibold mt-2">{value}</p>
        </div>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${toneCls}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
        <ArrowUp className="h-3 w-3 text-leaf" /> {delta}
      </p>
    </Card>
  );
}
