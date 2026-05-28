import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Replace } from "lucide-react";
import { getFood } from "@/lib/taco-foods";
import { calcFood, calcMealKcal, foodIcon } from "@/lib/food-utils";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/plano")({
  head: () => ({ meta: [{ title: "Plano do dia — Roteiro Nutri" }] }),
  component: Plano,
});

function Plano() {
  const { session, getPatient, getActivePlan, toggleMealConsumed, substituteFood } = useStore();
  const p = session.patientId ? getPatient(session.patientId) : undefined;
  const plan = p && getActivePlan(p.id);
  const [subState, setSubState] = useState<{ mealId: string; foodIndex: number } | null>(null);

  if (!p) return null;
  if (!plan) return (
    <div className="px-5 pt-6">
      <Header title="Plano do Dia" />
      <Card className="p-8 text-center mt-6"><p className="text-muted-foreground">Nenhum plano ativo.</p></Card>
    </div>
  );

  const today = plan.adherenceLog.today ?? [];
  const totalKcal = plan.meals.reduce((s, m) => s + calcMealKcal(m.foods), 0);
  const dateStr = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" });

  return (
    <div className="px-5 pt-6 space-y-4">
      <Header title="Plano do Dia" subtitle={dateStr} />
      <ul className="space-y-3">
        {plan.meals.map((m) => {
          const done = today.includes(m.id);
          return (
            <Card key={m.id} className={`p-4 bg-card border-border ${done ? "opacity-70" : ""}`}>
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl bg-accent/40 flex items-center justify-center text-xl">{foodIcon(m.foods[0]?.foodId ?? "")}</div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.time}</p>
                  </div>
                  <p className="text-xs text-primary font-mono mt-0.5">{calcMealKcal(m.foods)} kcal</p>
                  <ul className="mt-2 space-y-1">
                    {m.foods.map((f, i) => {
                      const food = getFood(f.foodId);
                      return food ? (
                        <li key={i} className="flex justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-foreground/80">{foodIcon(f.foodId)} {food.name} <span className="text-muted-foreground">· {f.grams}g</span></span>
                          {f.substitutes.length > 0 && (
                            <button onClick={() => setSubState({ mealId: m.id, foodIndex: i })} className="text-xs text-primary flex items-center gap-1">
                              <Replace className="h-3 w-3" /> Substituir
                            </button>
                          )}
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
                <button onClick={() => { toggleMealConsumed(plan.id, m.id); toast.success(done ? "Desmarcado" : "Refeição concluída!"); }}
                  className={`h-9 w-9 rounded-full flex items-center justify-center transition ${done ? "bg-primary text-primary-foreground" : "border-2 border-border bg-background"}`}>
                  {done && <Check className="h-5 w-5" />}
                </button>
              </div>
            </Card>
          );
        })}
      </ul>
      <div className="flex justify-between items-center px-1 pt-2">
        <span className="text-sm text-muted-foreground">Total do dia</span>
        <span className="font-display font-semibold text-primary">{totalKcal} kcal</span>
      </div>

      {subState && (() => {
        const meal = plan.meals.find((m) => m.id === subState.mealId)!;
        const item = meal.foods[subState.foodIndex];
        const food = getFood(item.foodId)!;
        return (
          <div className="fixed inset-0 z-50 bg-foreground/40 flex items-end justify-center" onClick={() => setSubState(null)}>
            <div className="bg-card w-full max-w-md rounded-t-3xl p-5 max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-1">
                <button onClick={() => setSubState(null)}><ArrowLeft className="h-5 w-5" /></button>
                <p className="font-semibold flex-1 text-center">Substituir alimento</p>
                <span className="w-5" />
              </div>
              <p className="text-sm text-muted-foreground text-center">{meal.name}</p>
              <Card className="p-3 mt-3 bg-background border-border flex items-center gap-2">
                <span className="text-xl">{foodIcon(item.foodId)}</span>
                <div className="flex-1"><p className="text-sm font-medium">{food.name} ({item.grams}g)</p><p className="text-xs text-muted-foreground">Atual</p></div>
              </Card>
              <p className="text-xs font-medium text-muted-foreground mt-4 mb-2">OPÇÕES EQUIVALENTES</p>
              <ul className="space-y-2">
                {item.substitutes.map((s, i) => {
                  const f = getFood(s.foodId);
                  if (!f) return null;
                  const c = calcFood(f, s.grams);
                  return (
                    <li key={i}>
                      <button onClick={() => { substituteFood(plan.id, meal.id, subState.foodIndex, s.foodId, s.grams); toast.success(`Substituído por ${f.name}`); setSubState(null); }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary transition">
                        <span className="text-2xl">{foodIcon(s.foodId)}</span>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">{f.name} ({s.grams}g)</p>
                          <p className="text-xs text-muted-foreground">{c.kcal} kcal</p>
                        </div>
                        <Replace className="h-4 w-4 text-primary" />
                      </button>
                    </li>
                  );
                })}
              </ul>
              <Button className="w-full mt-4 bg-primary hover:bg-leaf-deep" onClick={() => setSubState(null)}>Manter atual</Button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Link to="/app"><ArrowLeft className="h-5 w-5" /></Link>
      <div className="flex-1 text-center">
        <p className="font-semibold">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground capitalize">{subtitle}</p>}
      </div>
      <span className="w-5" />
    </div>
  );
}
