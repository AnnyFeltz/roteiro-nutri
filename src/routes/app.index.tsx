import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { Bell, Timer, Leaf, ChevronRight, Flame, CalendarCheck, TrendingDown, Sparkles } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { calcMealKcal } from "@/lib/food-utils";
import { getFood } from "@/lib/taco-foods";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Início — Roteiro Nutri" }] }),
  component: Home,
});

function Home() {
  const { session, getPatient, getActivePlan, nutritionist } = useStore();
  const p = session.patientId ? getPatient(session.patientId) : undefined;
  if (!p) return null;
  const plan = getActivePlan(p.id);
  const total = plan?.meals.length ?? 0;
  const today = plan?.adherenceLog.today ?? [];
  const done = today.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const next = plan?.meals.find((m) => !today.includes(m.id));

  // consumed macros today (sum of completed meals)
  const consumedKcal = plan
    ? plan.meals.filter((m) => today.includes(m.id)).reduce((s, m) => s + calcMealKcal(m.foods), 0)
    : 0;
  const targetKcal = plan?.targetKcal ?? 0;
  const consumedMacros = computeMacros(plan, today);
  const targetMacrosG = plan
    ? {
        carbs: Math.round((plan.targetKcal * plan.macros.carbs) / 100 / 4),
        protein: Math.round((plan.targetKcal * plan.macros.protein) / 100 / 4),
        fat: Math.round((plan.targetKcal * plan.macros.fat) / 100 / 9),
      }
    : { carbs: 0, protein: 0, fat: 0 };

  const adherence = [
    { name: "ok", value: pct, color: "var(--primary)" },
    { name: "rest", value: 100 - pct, color: "var(--muted)" },
  ];

  const weekData = [
    { d: "S", v: 80 }, { d: "T", v: 95 }, { d: "Q", v: 70 }, { d: "Q", v: 100 },
    { d: "S", v: 88 }, { d: "S", v: 92 }, { d: "D", v: pct },
  ];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  return (
    <div className="px-5 pt-6 pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <Logo className="h-8" />
        <button className="relative p-2"><Bell className="h-5 w-5 text-foreground/70" /><span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-terracotta" /></button>
      </div>

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{greeting},</p>
        <h1 className="text-2xl font-display font-semibold">{p.name.split(" ")[0]} 👋</h1>
        <p className="text-sm text-muted-foreground">Vamos para mais um dia de conquistas.</p>
      </div>

      {/* Daily energy ring + macros */}
      <Card className="p-5 bg-card border-border overflow-hidden relative">
        <div className="flex items-center gap-5">
          <div className="relative h-28 w-28 shrink-0">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={[{ v: Math.min(consumedKcal, targetKcal) }, { v: Math.max(targetKcal - consumedKcal, 0) }]}
                  dataKey="v" innerRadius={36} outerRadius={52} startAngle={90} endAngle={-270} stroke="none">
                  <Cell fill="var(--primary)" />
                  <Cell fill="var(--muted)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[10px] text-muted-foreground">Kcal</p>
              <p className="font-display font-semibold text-lg leading-none">{consumedKcal}</p>
              <p className="text-[10px] text-muted-foreground">/ {targetKcal}</p>
            </div>
          </div>
          <div className="flex-1 space-y-2.5">
            <MacroBar label="Carboidratos" color="var(--chart-3)" v={consumedMacros.carbs} max={targetMacrosG.carbs} />
            <MacroBar label="Proteínas" color="var(--primary)" v={consumedMacros.protein} max={targetMacrosG.protein} />
            <MacroBar label="Gorduras" color="var(--terracotta)" v={consumedMacros.fat} max={targetMacrosG.fat} />
          </div>
        </div>
      </Card>

      {/* Next meal */}
      {next && (
        <Link to="/app/plano" className="block">
          <Card className="p-4 bg-gradient-to-br from-primary to-leaf-deep text-primary-foreground border-0 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center"><Timer className="h-6 w-6" /></div>
              <div className="flex-1">
                <p className="text-xs opacity-80">Próxima refeição</p>
                <p className="font-display font-semibold text-lg">{next.name}</p>
                <p className="text-xs opacity-80">{next.foods.length} alimentos · {calcMealKcal(next.foods)} kcal</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-mono">{next.time}</p>
                <ChevronRight className="h-4 w-4 ml-auto opacity-70" />
              </div>
            </div>
          </Card>
        </Link>
      )}

      {/* Mini stats row */}
      <div className="grid grid-cols-3 gap-2.5">
        <MiniStat icon={<Flame className="h-4 w-4 text-terracotta" />} label="Sequência" value="7 dias" />
        <MiniStat icon={<TrendingDown className="h-4 w-4 text-leaf" />} label="Peso" value={`${p.weightKg} kg`} />
        <MiniStat icon={<CalendarCheck className="h-4 w-4 text-primary" />} label="Consulta" value={p.nextConsult.slice(0, 5)} />
      </div>

      {/* Today's checklist preview */}
      {plan && (
        <Card className="p-5 bg-card border-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Refeições de hoje</p>
            <p className="text-xs text-muted-foreground">{done}/{total} concluídas</p>
          </div>
          <div className="flex items-center gap-1.5 mb-4">
            {plan.meals.map((m) => (
              <div key={m.id} className={`flex-1 h-1.5 rounded-full ${today.includes(m.id) ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          <ul className="space-y-1.5">
            {plan.meals.slice(0, 3).map((m) => {
              const checked = today.includes(m.id);
              const first = getFood(m.foods[0]?.foodId ?? "");
              return (
                <li key={m.id} className="flex items-center gap-3 text-sm">
                  <span className={`h-2 w-2 rounded-full ${checked ? "bg-primary" : "bg-border"}`} />
                  <span className="text-xs font-mono text-muted-foreground w-12">{m.time}</span>
                  <span className={`flex-1 ${checked ? "line-through text-muted-foreground" : ""}`}>{m.name}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[100px]">{first?.name ?? "—"}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {/* Weekly adherence */}
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium">Adesão semanal</p>
            <p className="text-xs text-muted-foreground">média {Math.round(weekData.reduce((s, x) => s + x.v, 0) / weekData.length)}%</p>
          </div>
          <p className="font-display font-semibold text-xl flex items-center gap-1 text-leaf">
            Ótima <Leaf className="h-4 w-4" />
          </p>
        </div>
        <div className="h-24">
          <ResponsiveContainer>
            <BarChart data={weekData} margin={{ top: 0, right: 0, left: -30, bottom: -5 }}>
              <XAxis dataKey="d" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                {weekData.map((_, i) => (
                  <Cell key={i} fill={i === weekData.length - 1 ? "var(--primary)" : "var(--leaf)"} fillOpacity={i === weekData.length - 1 ? 1 : 0.45} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Nutritionist card */}
      <Card className="p-4 bg-accent/40 border-border">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-semibold">DC</div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Sua nutricionista</p>
            <p className="font-medium text-sm">{nutritionist.name}</p>
            <p className="text-xs text-muted-foreground">{nutritionist.crn}</p>
          </div>
          <Sparkles className="h-5 w-5 text-terracotta" />
        </div>
      </Card>

      <Link to="/app/plano" className="block">
        <Card className="p-4 bg-card border border-primary/30 flex items-center justify-between">
          <span className="font-medium text-primary">Ver plano completo do dia</span>
          <ChevronRight className="h-5 w-5 text-primary" />
        </Card>
      </Link>
    </div>
  );
}

function MacroBar({ label, v, max, color }: { label: string; v: number; max: number; color: string }) {
  const pct = max ? Math.min(100, Math.round((v / max) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{v}/{max}g</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="p-3 bg-card border-border">
      <div className="flex items-center gap-1.5">{icon}<span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span></div>
      <p className="font-display font-semibold text-base mt-1">{value}</p>
    </Card>
  );
}

function computeMacros(plan: any, doneIds: string[]) {
  if (!plan) return { carbs: 0, protein: 0, fat: 0 };
  const acc = { carbs: 0, protein: 0, fat: 0 };
  for (const m of plan.meals) {
    if (!doneIds.includes(m.id)) continue;
    for (const f of m.foods) {
      const food = getFood(f.foodId);
      if (!food) continue;
      const r = f.grams / 100;
      acc.carbs += food.carbs * r;
      acc.protein += food.protein * r;
      acc.fat += food.fat * r;
    }
  }
  return { carbs: Math.round(acc.carbs), protein: Math.round(acc.protein), fat: Math.round(acc.fat) };
}
