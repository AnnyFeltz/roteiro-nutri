import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";
import { calcMealKcal, foodIcon } from "@/lib/food-utils";

export const Route = createFileRoute("/app/plano")({
  head: () => ({ meta: [{ title: "Plano do dia — Roteiro Nutri" }] }),
  component: Plano,
});

function Plano() {
  const { session, getPatient, getActivePlan } = useStore();
  const p = session.patientId ? getPatient(session.patientId) : undefined;
  const plan = p && getActivePlan(p.id);

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

      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium pt-2 px-1">Refeições do dia</p>

      <ul className="space-y-3">
        {plan.meals.map((m) => {
          const done = today.includes(m.id);
          const mealKcal = calcMealKcal(m.foods);
          return (
            <li key={m.id}>
              <Link
                to="/app/plano/$mealId"
                params={{ mealId: m.id }}
                className="block"
              >
                <Card className={`p-4 bg-card border-border transition hover:border-primary/40 hover:shadow-soft active:scale-[0.99] ${done ? "border-primary/40 bg-primary/[0.03]" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${done ? "bg-primary/15" : "bg-accent/40"}`}>
                      {foodIcon(m.foods[0]?.foodId ?? "")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-display font-semibold text-lg">{m.name}</p>
                        {done && (
                          <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <span className="font-mono">{m.time}</span> · {mealKcal} kcal · {m.foods.length} alimentos
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="flex justify-between items-center px-1 pt-1">
        <span className="text-sm text-muted-foreground">Total planejado</span>
        <span className="font-display font-semibold text-primary text-lg">{totalKcal} kcal</span>
      </div>
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
