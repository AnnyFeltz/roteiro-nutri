import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Replace, Info } from "lucide-react";
import { getFood } from "@/lib/taco-foods";
import { calcFood, foodIcon, calcMealKcal } from "@/lib/food-utils";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/plano/$mealId")({
  head: () => ({ meta: [{ title: "Refeição — Roteiro Nutri" }] }),
  component: MealDetail,
});

function MealDetail() {
  const { mealId } = Route.useParams();
  const nav = useNavigate();
  const { session, getPatient, getActivePlan, toggleMealConsumed, substituteFood } = useStore();
  const p = session.patientId ? getPatient(session.patientId) : undefined;
  const plan = p && getActivePlan(p.id);
  const [subIndex, setSubIndex] = useState<number | null>(null);

  if (!p || !plan) return null;
  const meal = plan.meals.find((m) => m.id === mealId);
  if (!meal) return (
    <div className="px-5 pt-6">
      <TopBar onBack={() => nav({ to: "/app/plano" })} title="Refeição" />
      <Card className="p-8 text-center mt-6"><p className="text-muted-foreground">Refeição não encontrada.</p></Card>
    </div>
  );

  const today = plan.adherenceLog.today ?? [];
  const done = today.includes(meal.id);
  const mealKcal = calcMealKcal(meal.foods);

  // Aggregate macros for this meal
  const macros = meal.foods.reduce(
    (acc, f) => {
      const food = getFood(f.foodId);
      if (!food) return acc;
      const c = calcFood(food, f.grams);
      return { carbs: acc.carbs + c.carbs, protein: acc.protein + c.protein, fat: acc.fat + c.fat };
    },
    { carbs: 0, protein: 0, fat: 0 }
  );

  return (
    <div className="px-5 pt-6 pb-6 space-y-4">
      <TopBar onBack={() => nav({ to: "/app/plano" })} title={meal.name} subtitle={meal.time} />

      {/* Meal summary header */}
      <Card className="p-5 bg-gradient-to-br from-primary to-leaf-deep text-primary-foreground border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider opacity-80">{done ? "Concluída" : "Planejada"}</p>
            <p className="font-display font-semibold text-3xl mt-1">{mealKcal}<span className="text-base opacity-70"> kcal</span></p>
          </div>
          <div className="text-right text-xs space-y-0.5 opacity-90">
            <p>C <span className="font-semibold">{macros.carbs.toFixed(0)}g</span></p>
            <p>P <span className="font-semibold">{macros.protein.toFixed(0)}g</span></p>
            <p>G <span className="font-semibold">{macros.fat.toFixed(0)}g</span></p>
          </div>
        </div>
        <Button
          onClick={() => { toggleMealConsumed(plan.id, meal.id); toast.success(done ? "Desmarcado" : "Refeição concluída!"); }}
          className={`w-full mt-4 gap-2 ${done ? "bg-white/15 hover:bg-white/25 text-primary-foreground" : "bg-white text-primary hover:bg-white/90"}`}
        >
          <Check className="h-4 w-4" />
          {done ? "Marcar como não consumida" : "Marcar como consumida"}
        </Button>
      </Card>

      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium pt-1 px-1">Alimentos</p>

      <ul className="space-y-2">
        {meal.foods.map((f, i) => {
          const food = getFood(f.foodId);
          if (!food) return null;
          const c = calcFood(food, f.grams);
          return (
            <Card key={i} className="p-3 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-accent/40 flex items-center justify-center text-xl shrink-0">
                  {foodIcon(f.foodId)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{food.name}</p>
                  <p className="text-[11px] text-muted-foreground">{f.grams}g · {c.kcal} kcal · C {c.carbs}g · P {c.protein}g · G {c.fat}g</p>
                </div>
                {f.substitutes.length > 0 ? (
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs shrink-0" onClick={() => setSubIndex(i)}>
                    <Replace className="h-3.5 w-3.5" /> Substituir
                  </Button>
                ) : (
                  <span className="text-[10px] text-muted-foreground px-2 shrink-0">sem subst.</span>
                )}
              </div>
            </Card>
          );
        })}
        {meal.foods.length === 0 && (
          <Card className="p-6 text-center"><p className="text-sm text-muted-foreground">Nenhum alimento nesta refeição.</p></Card>
        )}
      </ul>

      <Card className="p-4 bg-accent/30 border-border">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-terracotta mt-0.5 shrink-0" />
          <p className="text-xs text-foreground/80">
            Toque em <strong className="text-primary">Substituir</strong> para trocar um alimento por um equivalente nutricional aprovado pela sua nutricionista.
          </p>
        </div>
      </Card>

      {subIndex !== null && (() => {
        const item = meal.foods[subIndex];
        const food = getFood(item.foodId)!;
        const cur = calcFood(food, item.grams);
        return (
          <div className="fixed inset-0 z-50 bg-foreground/40 flex items-end justify-center" onClick={() => setSubIndex(null)}>
            <div className="bg-card w-full max-w-md rounded-t-3xl p-5 max-h-[85vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-3" />
              <div className="flex items-center gap-2 mb-1">
                <button onClick={() => setSubIndex(null)}><ArrowLeft className="h-5 w-5" /></button>
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
                      <button
                        onClick={() => { substituteFood(plan.id, meal.id, subIndex, s.foodId, s.grams); toast.success(`Substituído por ${f.name}`); setSubIndex(null); }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition text-left"
                      >
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
                {item.substitutes.length === 0 && (
                  <li className="text-sm text-muted-foreground text-center py-4">Nenhum equivalente cadastrado.</li>
                )}
              </ul>
              <Button variant="outline" className="w-full mt-4" onClick={() => setSubIndex(null)}>Manter atual</Button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function TopBar({ onBack, title, subtitle }: { onBack: () => void; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={onBack}><ArrowLeft className="h-5 w-5" /></button>
      <div className="flex-1 text-center">
        <p className="font-display font-semibold">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground font-mono">{subtitle}</p>}
      </div>
      <span className="w-5" />
    </div>
  );
}
