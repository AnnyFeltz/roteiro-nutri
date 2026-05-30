import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Replace, Info } from "lucide-react";
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
  const consumedKcal = plan.meals.filter((m) => today.includes(m.id)).reduce((s, m) => s + calcMealKcal(m.foods), 0);
  const kcalPct = plan.targetKcal ? Math.min(100, Math.round((consumedKcal / plan.targetKcal) * 100)) : 0;
  const dateStr = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });

  return (
    <div className="px-5 pt-6 pb-4 space-y-4">
      <Header title="Plano do Dia" subtitle={dateStr} />

      {/* Daily summary */}
      <Card className="p-5 bg-gradient-to-br from-primary to-leaf-deep text-primary-foreground border-0">
        <p className="text-xs uppercase tracking-wider opacity-80">{plan.name}</p>
        <div className="flex items-baseline justify-between mt-1">
          <p className="font-display font-semibold text-3xl">{consumedKcal}<span className="text-base opacity-70"> / {plan.targetKcal} kcal</span></p>
          <Badge className="bg-white/20 text-primary-foreground border-0 hover:bg-white/30">{kcalPct}%</Badge>
        </div>
        <div className="h-2 rounded-full bg-white/15 mt-3 overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${kcalPct}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div className="bg-white/10 rounded-lg py-2">
            <p className="text-[10px] opacity-80">CARB</p>
            <p className="font-display font-semibold">{plan.macros.carbs}%</p>
          </div>
          <div className="bg-white/10 rounded-lg py-2">
            <p className="text-[10px] opacity-80">PROT</p>
            <p className="font-display font-semibold">{plan.macros.protein}%</p>
          </div>
          <div className="bg-white/10 rounded-lg py-2">
            <p className="text-[10px] opacity-80">GORD</p>
            <p className="font-display font-semibold">{plan.macros.fat}%</p>
          </div>
        </div>
      </Card>

      <ul className="space-y-3">
        {plan.meals.map((m) => {
          const done = today.includes(m.id);
          const mealKcal = calcMealKcal(m.foods);
          return (
            <Card key={m.id} className={`p-4 bg-card border-border transition ${done ? "border-primary/40 bg-primary/[0.03]" : ""}`}>
              <div className="flex items-start gap-3">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${done ? "bg-primary/15" : "bg-accent/40"}`}>
                  {foodIcon(m.foods[0]?.foodId ?? "")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="font-display font-semibold">{m.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">{m.time}</p>
                  </div>
                  <p className="text-xs text-primary font-medium mt-0.5">{mealKcal} kcal · {m.foods.length} alimentos</p>
                </div>
                <button onClick={() => { toggleMealConsumed(plan.id, m.id); toast.success(done ? "Desmarcado" : "Refeição concluída!"); }}
                  className={`h-9 w-9 rounded-full flex items-center justify-center transition shrink-0 ${done ? "bg-primary text-primary-foreground" : "border-2 border-border bg-background hover:border-primary"}`}>
                  {done && <Check className="h-5 w-5" />}
                </button>
              </div>

              <ul className="mt-3 space-y-1.5 pl-1">
                {m.foods.map((f, i) => {
                  const food = getFood(f.foodId);
                  if (!food) return null;
                  const c = calcFood(food, f.grams);
                  return (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-base">{foodIcon(f.foodId)}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`truncate ${done ? "text-muted-foreground" : "text-foreground/90"}`}>{food.name}</p>
                        <p className="text-[11px] text-muted-foreground">{f.grams}g · {c.kcal} kcal</p>
                      </div>
                      {f.substitutes.length > 0 && (
                        <button onClick={() => setSubState({ mealId: m.id, foodIndex: i })}
                          className="text-[11px] text-primary flex items-center gap-1 px-2 py-1 rounded-md hover:bg-primary/10 transition shrink-0">
                          <Replace className="h-3 w-3" /> {f.substitutes.length}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </ul>

      <Card className="p-4 bg-accent/30 border-border">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-terracotta mt-0.5 shrink-0" />
          <p className="text-xs text-foreground/80">
            Toque em <strong className="text-primary">Substituir</strong> em qualquer alimento para trocar por um equivalente nutricional aprovado pela sua nutricionista.
          </p>
        </div>
      </Card>

      <div className="flex justify-between items-center px-1 pt-1">
        <span className="text-sm text-muted-foreground">Total planejado</span>
        <span className="font-display font-semibold text-primary text-lg">{totalKcal} kcal</span>
      </div>

      {subState && (() => {
        const meal = plan.meals.find((m) => m.id === subState.mealId)!;
        const item = meal.foods[subState.foodIndex];
        const food = getFood(item.foodId)!;
        const cur = calcFood(food, item.grams);
        return (
          <div className="fixed inset-0 z-50 bg-foreground/40 flex items-end justify-center" onClick={() => setSubState(null)}>
            <div className="bg-card w-full max-w-md rounded-t-3xl p-5 max-h-[85vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-3" />
              <div className="flex items-center gap-2 mb-1">
                <button onClick={() => setSubState(null)}><ArrowLeft className="h-5 w-5" /></button>
                <p className="font-display font-semibold flex-1 text-center">Substituir alimento</p>
                <span className="w-5" />
              </div>
              <p className="text-xs text-muted-foreground text-center">{meal.name}</p>

              <Card className="p-3 mt-3 bg-accent/30 border-border flex items-center gap-3">
                <span className="text-2xl">{foodIcon(item.foodId)}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{food.name}</p>
                  <p className="text-xs text-muted-foreground">{item.grams}g · {cur.kcal} kcal</p>
                </div>
                <Badge className="bg-primary/15 text-primary border-0">Atual</Badge>
              </Card>

              <p className="text-xs font-medium text-muted-foreground mt-5 mb-2 uppercase tracking-wider">Opções equivalentes</p>
              <ul className="space-y-2">
                {item.substitutes.map((s, i) => {
                  const f = getFood(s.foodId);
                  if (!f) return null;
                  const c = calcFood(f, s.grams);
                  const diff = c.kcal - cur.kcal;
                  return (
                    <li key={i}>
                      <button onClick={() => { substituteFood(plan.id, meal.id, subState.foodIndex, s.foodId, s.grams); toast.success(`Substituído por ${f.name}`); setSubState(null); }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition text-left">
                        <span className="text-2xl">{foodIcon(s.foodId)}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{f.name}</p>
                          <p className="text-xs text-muted-foreground">{s.grams}g · {c.kcal} kcal</p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${Math.abs(diff) <= 20 ? "border-leaf text-leaf" : "border-terracotta text-terracotta"}`}>
                          {diff > 0 ? "+" : ""}{diff} kcal
                        </Badge>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <Button variant="outline" className="w-full mt-4" onClick={() => setSubState(null)}>Manter atual</Button>
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
        <p className="font-display font-semibold">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground capitalize">{subtitle}</p>}
      </div>
      <span className="w-5" />
    </div>
  );
}
