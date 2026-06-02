import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil, Clock, Apple, FileDown, CheckCircle2 } from "lucide-react";
import { calcFood, calcMealKcal, foodIcon } from "@/lib/food-utils";
import { getFood } from "@/lib/taco-foods";
import { macroGrams } from "@/lib/nutrition";

export const Route = createFileRoute("/nutri/pacientes/$id/plano_/$versionId")({
  head: () => ({ meta: [{ title: "Plano alimentar — Roteiro Nutri" }] }),
  component: PlanView,
});

function PlanView() {
  const { id, versionId } = Route.useParams();
  const { getPatient, getPlanById, getActivePlan } = useStore();
  const nav = useNavigate();
  const p = getPatient(id);

  if (!p) return <div className="p-6">Paciente não encontrado.</div>;

  // If versionId is "new" or unknown, redirect-ish to editor
  const isNew = versionId === "new";
  const plan = !isNew ? getPlanById(versionId) ?? getActivePlan(id) : undefined;

  if (!plan) {
    return (
      <div className="space-y-5">
        <Link to="/nutri/pacientes/$id" params={{ id: p.id }} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Voltar para {p.name}
        </Link>
        <Card className="p-12 bg-card border-border text-center">
          <Apple className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <h2 className="text-xl font-display font-semibold">Nenhum plano nesta versão</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-5">
            {isNew ? "Pronto para criar a primeira versão do plano alimentar." : `A versão "${versionId}" não foi encontrada. Crie uma nova versão a partir do zero.`}
          </p>
          <Button
            onClick={() => nav({ to: "/nutri/pacientes/$id/plano/editar{$versionId}", params: { id: p.id, versionId: "new" } })}
            className="bg-primary hover:bg-leaf-deep gap-2"
          >
            <Pencil className="h-4 w-4" /> Criar plano alimentar
          </Button>
        </Card>
      </div>
    );
  }

  const totalKcal = plan.meals.reduce((s, m) => s + calcMealKcal(m.foods), 0);
  const macroG = macroGrams(plan.targetKcal, plan.macros);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link to="/nutri/pacientes/$id" params={{ id: p.id }} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Voltar para {p.name}
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><FileDown className="h-4 w-4" /> Exportar PDF</Button>
          <Button
            onClick={() => nav({ to: "/nutri/pacientes/$id/plano/editar{$versionId}", params: { id: p.id, versionId: plan.id } })}
            className="bg-primary hover:bg-leaf-deep gap-2"
          >
            <Pencil className="h-4 w-4" /> Editar plano
          </Button>
        </div>
      </div>

      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 via-card to-card border-border">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="font-mono text-xs">v{plan.id.replace(/^v/, "")}</Badge>
              {plan.active && <Badge className="bg-primary/15 text-primary border-0 gap-1"><CheckCircle2 className="h-3 w-3" /> Ativo</Badge>}
              <span className="text-xs text-muted-foreground">Criado em {plan.createdAt}</span>
            </div>
            <h1 className="text-3xl font-display font-semibold">{plan.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">Paciente: {p.name} · {p.age} anos · objetivo {p.goal}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Calorias alvo</p>
            <p className="text-4xl font-display font-semibold text-primary">{plan.targetKcal}</p>
            <p className="text-xs text-muted-foreground">kcal/dia · soma: {totalKcal} kcal</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <MacroPill label="Carboidratos" pct={plan.macros.carbs} grams={macroG.carbs} color="var(--chart-3)" />
          <MacroPill label="Proteínas" pct={plan.macros.protein} grams={macroG.protein} color="var(--primary)" />
          <MacroPill label="Gorduras" pct={plan.macros.fat} grams={macroG.fat} color="var(--terracotta)" />
        </div>
      </Card>

      {/* Meals */}
      <div className="space-y-4">
        {plan.meals.map((meal) => {
          const kcal = calcMealKcal(meal.foods);
          return (
            <Card key={meal.id} className="p-5 bg-card border-border">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Apple className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">{meal.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {meal.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-mono text-primary">{kcal} kcal</p>
                  <p className="text-xs text-muted-foreground">{meal.foods.length} alimento{meal.foods.length !== 1 && "s"}</p>
                </div>
              </div>

              {meal.foods.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Sem alimentos nesta refeição.</p>
              ) : (
                <ul className="space-y-2">
                  {meal.foods.map((f, i) => {
                    const food = getFood(f.foodId);
                    if (!food) return null;
                    const m = calcFood(food, f.grams);
                    return (
                      <li key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background/60 border border-border">
                        <span className="text-xl">{foodIcon(f.foodId)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{food.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {f.grams}g · {m.kcal} kcal · C {m.carbs}g · P {m.protein}g · G {m.fat}g
                          </p>
                          {f.substitutes.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              <span className="text-primary font-medium">{f.substitutes.length} equivalente{f.substitutes.length > 1 && "s"}:</span>{" "}
                              {f.substitutes.map((s) => getFood(s.foodId)?.name).filter(Boolean).join(", ")}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function MacroPill({ label, pct, grams, color }: { label: string; pct: number; grams: number; color: string }) {
  return (
    <div className="p-3 rounded-lg bg-background/60 border border-border">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        {label}
      </div>
      <p className="text-xl font-display font-semibold mt-1">{pct}%</p>
      <p className="text-xs text-muted-foreground">{grams}g</p>
    </div>
  );
}
