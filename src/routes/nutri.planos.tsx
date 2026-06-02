import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Apple, Search, Pencil, Eye, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { useState, useMemo } from "react";
import { calcMealKcal } from "@/lib/food-utils";

export const Route = createFileRoute("/nutri/planos")({
  head: () => ({ meta: [{ title: "Planos Alimentares — Roteiro Nutri" }] }),
  component: PlanosOverview,
});

function PlanosOverview() {
  const { patients, plans } = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"todos" | "com-plano" | "sem-plano">("todos");

  const rows = useMemo(() => {
    return patients
      .filter((p) => p.active)
      .map((p) => {
        const patientPlans = plans.filter((pl) => pl.patientId === p.id);
        const active = patientPlans.find((pl) => pl.active);
        return { patient: p, plans: patientPlans, active };
      })
      .filter((r) => {
        if (filter === "com-plano") return !!r.active;
        if (filter === "sem-plano") return !r.active;
        return true;
      })
      .filter((r) => r.patient.name.toLowerCase().includes(q.toLowerCase()));
  }, [patients, plans, q, filter]);

  const totalAtivos = patients.filter((p) => p.active).length;
  const comPlano = plans.filter((pl) => pl.active).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Planos Alimentares</h1>
        <p className="text-muted-foreground mt-1">Visualize, edite e versione os planos de todos os pacientes.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Pacientes ativos" value={totalAtivos} icon={<Apple className="h-4 w-4" />} />
        <StatCard label="Planos ativos" value={comPlano} icon={<CheckCircle2 className="h-4 w-4 text-primary" />} />
        <StatCard label="Sem plano" value={totalAtivos - comPlano} icon={<AlertCircle className="h-4 w-4 text-terracotta" />} />
      </div>

      <Card className="p-4 bg-card border-border">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar paciente..." className="pl-9 bg-background" />
          </div>
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(["todos", "com-plano", "sem-plano"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                  filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {f === "todos" ? "Todos" : f === "com-plano" ? "Com plano" : "Sem plano"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {rows.length === 0 && (
          <Card className="p-12 text-center bg-card border-border">
            <Apple className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum paciente encontrado.</p>
          </Card>
        )}
        {rows.map(({ patient: p, plans: ps, active }) => {
          const initials = p.name.split(" ").map((s) => s[0]).slice(0, 2).join("");
          const totalKcal = active ? active.meals.reduce((s, m) => s + calcMealKcal(m.foods), 0) : 0;
          return (
            <Card key={p.id} className="p-5 bg-card border-border hover:shadow-sm transition">
              <div className="flex flex-wrap items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback style={{ background: p.avatarColor, color: "white" }}>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-[200px]">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {p.goal} · {p.age} anos · {ps.length} versão{ps.length !== 1 && "ões"} no histórico
                  </p>
                </div>

                {active ? (
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Plano ativo</p>
                      <p className="font-medium flex items-center gap-1.5">
                        <Badge variant="outline" className="font-mono text-[10px] py-0">v{active.id.replace(/^v/, "")}</Badge>
                        {active.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Meta</p>
                      <p className="font-mono text-primary">{active.targetKcal} kcal</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Soma refeições</p>
                      <p className="font-mono">{totalKcal} kcal</p>
                    </div>
                  </div>
                ) : (
                  <Badge variant="outline" className="text-terracotta border-terracotta/40">Sem plano ativo</Badge>
                )}

                <div className="flex gap-2 ml-auto">
                  {active ? (
                    <>
                      <Link to="/nutri/pacientes/$id/plano/$versionId" params={{ id: p.id, versionId: active.id }}>
                        <Button variant="outline" size="sm" className="gap-1.5"><Eye className="h-3.5 w-3.5" /> Ver</Button>
                      </Link>
                      <Link to="/nutri/pacientes/$id/plano/editar{$versionId}" params={{ id: p.id, versionId: active.id }}>
                        <Button size="sm" className="bg-primary hover:bg-leaf-deep gap-1.5"><Pencil className="h-3.5 w-3.5" /> Editar</Button>
                      </Link>
                    </>
                  ) : (
                    <Link to="/nutri/pacientes/$id/plano/editar{$versionId}" params={{ id: p.id, versionId: "new" }}>
                      <Button size="sm" className="bg-primary hover:bg-leaf-deep gap-1.5"><Plus className="h-3.5 w-3.5" /> Criar plano</Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        {icon}
      </div>
      <p className="text-3xl font-display font-semibold mt-1">{value}</p>
    </Card>
  );
}
