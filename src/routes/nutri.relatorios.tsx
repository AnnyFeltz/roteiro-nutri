import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, ClipboardList, TrendingDown, TrendingUp, Users, Apple, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { bmi, bmiLabel } from "@/lib/nutrition";

export const Route = createFileRoute("/nutri/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — Roteiro Nutri" }] }),
  component: Relatorios,
});

function Relatorios() {
  const { patients, plans } = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"ativos" | "inativos" | "todos">("todos");

  const stats = useMemo(() => {
    const active = patients.filter((p) => p.active);
    const totalLost = active.reduce((s, p) => s + Math.max(0, p.initialWeightKg - p.weightKg), 0);
    const activePlans = plans.filter((p) => p.active).length;
    return { activeCount: active.length, totalLost, activePlans };
  }, [patients, plans]);

  const list = useMemo(() => {
    return patients
      .filter((p) => filter === "todos" ? true : filter === "ativos" ? p.active : !p.active)
      .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [patients, q, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-display font-semibold">Relatórios e fichas</h1>
          <p className="text-muted-foreground mt-1">Gere a ficha médica/nutricional profissional de cada paciente em PDF.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Stat icon={Users} label="Pacientes ativos" value={stats.activeCount} />
        <Stat icon={Apple} label="Planos ativos" value={stats.activePlans} />
        <Stat icon={TrendingDown} label="Peso perdido (total)" value={`${stats.totalLost.toFixed(1)} kg`} />
        <Stat icon={Target} label="Fichas disponíveis" value={patients.length} />
      </div>

      <Card className="p-4 bg-card border-border">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar paciente..." className="pl-9 bg-background" />
          </div>
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(["ativos", "inativos", "todos"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition ${filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>{f}</button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="bg-card border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium">Fichas médicas/nutricionais por paciente</p>
        </div>
        <ul className="divide-y divide-border">
          {list.map((p) => {
            const imcVal = bmi(p.weightKg, p.heightCm);
            const diff = +(p.weightKg - p.initialWeightKg).toFixed(1);
            const Icon = diff < 0 ? TrendingDown : TrendingUp;
            return (
              <li key={p.id} className="px-5 py-3 flex flex-wrap items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0" style={{ background: p.avatarColor }}>
                  {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground capitalize truncate">
                    {p.goal} · IMC {imcVal.toFixed(1)} ({bmiLabel(imcVal)}) · {p.initialWeightKg}→{p.weightKg}kg
                  </p>
                </div>
                <Badge variant="outline" className={`${diff < 0 ? "border-leaf text-leaf" : diff > 0 ? "border-terracotta text-terracotta" : ""} gap-1 hidden sm:inline-flex`}>
                  <Icon className="h-3 w-3" /> {Math.abs(diff)} kg
                </Badge>
                {p.active ? <Badge className="bg-primary/15 text-primary border-0">Ativo</Badge> : <Badge variant="outline">Inativo</Badge>}
                <Link to="/nutri/pacientes/$id_/ficha" params={{ id: p.id }}>
                  <Button size="sm" className="bg-primary hover:bg-leaf-deep gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Abrir ficha
                  </Button>
                </Link>
              </li>
            );
          })}
          {list.length === 0 && (
            <li className="text-center py-12 text-sm text-muted-foreground">Nenhum paciente encontrado.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <Card className="p-4 sm:p-5 bg-card border-border">
      <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary mb-3">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl sm:text-3xl font-display font-semibold mt-1">{value}</p>
    </Card>
  );
}
