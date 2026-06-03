import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useStore, type Meal, type MealPlan, type MealFoodItem } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Calculator, Replace, X } from "lucide-react";
import { useState, useMemo } from "react";
import { mifflinStJeor, harrisBenedict, calcGET, adjustForGoal, macroGrams, type ActivityLevel } from "@/lib/nutrition";
import { TACO_FOODS } from "@/lib/taco-foods";
import { calcFood, calcMealKcal, foodIcon } from "@/lib/food-utils";
import { getFood } from "@/lib/taco-foods";
import { toast } from "sonner";

export const Route = createFileRoute("/nutri/pacientes/$id_/plano/editar{$versionId}")({
  head: () => ({ meta: [{ title: "Editor de Plano — Roteiro Nutri" }] }),
  component: PlanEditor,
});

function PlanEditor() {
  const params = Route.useParams() as { id?: string; id_?: string; versionId: string };
  const id = params.id ?? params.id_;
  const { versionId } = params;
  const { getPatient, getPlanById, getActivePlan, upsertPlan } = useStore();
  const nav = useNavigate();
  if (!id) return <div>Paciente não encontrado.</div>;
  const p = getPatient(id);
  const isNew = versionId === "new";
  const existing = !isNew ? getPlanById(versionId) : undefined;
  const template = existing ?? (!isNew && p ? getActivePlan(p.id) : undefined);

  const [formula, setFormula] = useState<"mifflin" | "harris">("mifflin");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [macros, setMacros] = useState(template?.macros ?? { carbs: 40, protein: 30, fat: 30 });
  const [targetKcal, setTargetKcal] = useState(template?.targetKcal ?? 1700);
  const [meals, setMeals] = useState<Meal[]>(template?.meals ?? defaultMeals());
  const [planName, setPlanName] = useState(template?.name ?? "Plano alimentar personalizado");

  if (!p) return <div>Paciente não encontrado.</div>;

  const tmb = formula === "mifflin"
    ? mifflinStJeor(p.weightKg, p.heightCm, p.age, p.sex)
    : harrisBenedict(p.weightKg, p.heightCm, p.age, p.sex);
  const get = calcGET(tmb, activity);
  const recommended = Math.round(adjustForGoal(get, p.goal));
  const macroG = macroGrams(targetKcal, macros);
  const sumMacros = macros.carbs + macros.protein + macros.fat;

  const totalKcal = meals.reduce((sum, m) => sum + calcMealKcal(m.foods), 0);

  const save = () => {
    if (sumMacros !== 100) { toast.error("Macros devem somar 100%"); return; }
    const newId = existing?.id ?? `v${Date.now()}`;
    const plan: MealPlan = {
      id: newId,
      patientId: p.id, name: planName, active: true,
      createdAt: existing?.createdAt ?? new Date().toLocaleDateString("pt-BR"),
      targetKcal, macros, meals, adherenceLog: existing?.adherenceLog ?? {},
    };
    upsertPlan(plan);
    toast.success(existing ? "Versão do plano atualizada" : "Nova versão do plano criada (RN07)");
    nav({ to: "/nutri/pacientes/$id/plano/$versionId", params: { id: p.id, versionId: newId } });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link to="/nutri/pacientes/$id" params={{ id: p.id }} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Voltar para {p.name}
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => nav({ to: "/nutri/pacientes/$id", params: { id: p.id } })}>Cancelar</Button>
          <Button className="bg-primary hover:bg-leaf-deep" onClick={save}>Salvar plano</Button>
        </div>
      </div>

      <div className="flex items-baseline gap-3">
        <h1 className="text-3xl font-semibold">{existing ? "Editar" : "Criar"} plano alimentar</h1>
        <span className="text-muted-foreground">para {p.name}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 bg-card border-border lg:col-span-1 space-y-5">
          <div>
            <h3 className="font-display font-semibold flex items-center gap-2"><Calculator className="h-4 w-4 text-primary" /> Calculadora automática</h3>
            <p className="text-xs text-muted-foreground mt-1">{p.weightKg}kg · {p.heightCm}cm · {p.age} anos · {p.sex === "F" ? "Feminino" : "Masculino"}</p>
          </div>

          <div>
            <Label>Fórmula</Label>
            <Select value={formula} onValueChange={(v) => setFormula(v as any)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mifflin">Mifflin-St Jeor</SelectItem>
                <SelectItem value="harris">Harris-Benedict</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Nível de atividade</Label>
            <Select value={activity} onValueChange={(v) => setActivity(v as ActivityLevel)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentário</SelectItem>
                <SelectItem value="light">Leve (1-3x/sem)</SelectItem>
                <SelectItem value="moderate">Moderado (3-5x/sem)</SelectItem>
                <SelectItem value="active">Intenso (6-7x/sem)</SelectItem>
                <SelectItem value="veryActive">Muito intenso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
            <div><p className="text-xs text-muted-foreground">TMB</p><p className="text-xl font-display font-semibold">{Math.round(tmb)}</p></div>
            <div><p className="text-xs text-muted-foreground">GET</p><p className="text-xl font-display font-semibold">{Math.round(get)}</p></div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Sugerido para "{p.goal}"</p>
              <p className="text-2xl font-display font-semibold text-primary">{recommended} kcal</p>
              <Button variant="link" size="sm" className="px-0 h-auto text-xs" onClick={() => setTargetKcal(recommended)}>Aplicar valor sugerido →</Button>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <Label>Calorias alvo</Label>
            <Input type="number" value={targetKcal} onChange={(e) => setTargetKcal(+e.target.value)} />
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex justify-between items-center">
              <Label>Macronutrientes</Label>
              <span className={`text-xs font-medium ${sumMacros === 100 ? "text-leaf" : "text-destructive"}`}>{sumMacros}%</span>
            </div>
            <MacroSlider label="Carboidratos" color="var(--chart-3)" value={macros.carbs} grams={macroG.carbs} onChange={(v) => setMacros({ ...macros, carbs: v })} />
            <MacroSlider label="Proteínas" color="var(--primary)" value={macros.protein} grams={macroG.protein} onChange={(v) => setMacros({ ...macros, protein: v })} />
            <MacroSlider label="Gorduras" color="var(--terracotta)" value={macros.fat} grams={macroG.fat} onChange={(v) => setMacros({ ...macros, fat: v })} />
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5 bg-card border-border">
            <div className="flex flex-wrap items-end gap-3 justify-between">
              <div className="flex-1 min-w-[200px]">
                <Label>Nome do plano</Label>
                <Input className="mt-1.5" value={planName} onChange={(e) => setPlanName(e.target.value)} />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total atual</p>
                <p className="text-2xl font-display font-semibold text-primary">{totalKcal} kcal</p>
                <p className="text-xs text-muted-foreground">Alvo: {targetKcal} kcal</p>
              </div>
            </div>
          </Card>

          {meals.map((meal, mealIdx) => (
            <MealBlock key={meal.id} meal={meal}
              onUpdate={(m) => setMeals((prev) => prev.map((x, i) => i === mealIdx ? m : x))}
              onRemove={() => setMeals((prev) => prev.filter((_, i) => i !== mealIdx))}
            />
          ))}

          <Button variant="outline" className="w-full border-dashed gap-2" onClick={() => setMeals([...meals, { id: `m${Date.now()}`, name: "Nova refeição", time: "12:00", foods: [] }])}>
            <Plus className="h-4 w-4" /> Adicionar refeição
          </Button>
        </div>
      </div>
    </div>
  );
}

function defaultMeals(): Meal[] {
  return [
    { id: "m1", name: "Café da manhã", time: "08:00", foods: [] },
    { id: "m2", name: "Almoço", time: "12:30", foods: [] },
    { id: "m3", name: "Lanche da tarde", time: "16:00", foods: [] },
    { id: "m4", name: "Jantar", time: "19:00", foods: [] },
  ];
}

function MacroSlider({ label, color, value, grams, onChange }: { label: string; color: string; value: number; grams: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: color }} />{label}</span>
        <span className="font-medium">{value}% · {grams}g</span>
      </div>
      <Slider value={[value]} max={70} min={5} step={1} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}

function MealBlock({ meal, onUpdate, onRemove }: { meal: Meal; onUpdate: (m: Meal) => void; onRemove: () => void }) {
  const [picking, setPicking] = useState(false);
  return (
    <Card className="p-5 bg-card border-border">
      <div className="flex items-center gap-3">
        <Input className="max-w-[220px]" value={meal.name} onChange={(e) => onUpdate({ ...meal, name: e.target.value })} />
        <Input type="time" className="max-w-[120px]" value={meal.time} onChange={(e) => onUpdate({ ...meal, time: e.target.value })} />
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm font-mono text-primary">{calcMealKcal(meal.foods)} kcal</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onRemove}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {meal.foods.map((f, i) => (
          <FoodRow key={i} item={f}
            onChange={(updated) => onUpdate({ ...meal, foods: meal.foods.map((x, j) => j === i ? updated : x) })}
            onRemove={() => onUpdate({ ...meal, foods: meal.foods.filter((_, j) => j !== i) })}
          />
        ))}
      </ul>

      <Button variant="outline" size="sm" className="mt-3 w-full border-dashed gap-2" onClick={() => setPicking(true)}>
        <Plus className="h-4 w-4" /> Adicionar alimento
      </Button>

      <FoodPicker open={picking} onOpenChange={setPicking} onPick={(foodId) => {
        onUpdate({ ...meal, foods: [...meal.foods, { foodId, grams: 100, substitutes: [] }] });
        setPicking(false);
      }} />
    </Card>
  );
}

function FoodRow({ item, onChange, onRemove }: { item: MealFoodItem; onChange: (i: MealFoodItem) => void; onRemove: () => void }) {
  const food = getFood(item.foodId);
  if (!food) return null;
  const macros = calcFood(food, item.grams);

  return (
    <li className="flex items-center gap-3 p-3 rounded-lg bg-background/60 border border-border">
      <span className="text-xl">{foodIcon(item.foodId)}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{food.name}</p>
        <p className="text-xs text-muted-foreground">{macros.kcal} kcal · C {macros.carbs}g · P {macros.protein}g · G {macros.fat}g · {item.substitutes.length} substituições</p>
      </div>
      <div className="flex items-center gap-1">
        <Input type="number" className="w-20 h-8" value={item.grams} onChange={(e) => onChange({ ...item, grams: +e.target.value || 0 })} />
        <span className="text-xs text-muted-foreground">g</span>
      </div>
      <SubstitutionDialog item={item} onChange={onChange} />
      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onRemove}><X className="h-4 w-4" /></Button>
    </li>
  );
}

function SubstitutionDialog({ item, onChange }: { item: MealFoodItem; onChange: (i: MealFoodItem) => void }) {
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setOpen(true)}>
        <Replace className="h-3.5 w-3.5" /> Substituições
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 bg-foreground/40 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <Card className="bg-card max-w-md w-full p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-semibold">Lista de substituição</h3>
            <p className="text-xs text-muted-foreground mb-3">Equivalentes que o paciente pode escolher.</p>
            <ul className="space-y-2 max-h-64 overflow-auto">
              {item.substitutes.map((s, i) => {
                const f = getFood(s.foodId);
                return f ? (
                  <li key={i} className="flex items-center gap-2 p-2 border border-border rounded-lg text-sm">
                    <span>{foodIcon(s.foodId)}</span><span className="flex-1">{f.name} · {s.grams}g</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onChange({ ...item, substitutes: item.substitutes.filter((_, j) => j !== i) })}><X className="h-3.5 w-3.5" /></Button>
                  </li>
                ) : null;
              })}
              {item.substitutes.length === 0 && <li className="text-sm text-muted-foreground text-center py-3">Nenhum equivalente ainda.</li>}
            </ul>
            <Button variant="outline" className="w-full mt-3 gap-2" onClick={() => setPicking(true)}>
              <Plus className="h-4 w-4" /> Adicionar equivalente
            </Button>
            <FoodPicker open={picking} onOpenChange={setPicking} onPick={(foodId) => {
              onChange({ ...item, substitutes: [...item.substitutes, { foodId, grams: 100 }] });
              setPicking(false);
            }} />
            <Button className="w-full mt-3 bg-primary hover:bg-leaf-deep" onClick={() => setOpen(false)}>Pronto</Button>
          </Card>
        </div>
      )}
    </>
  );
}

function FoodPicker({ open, onOpenChange, onPick }: { open: boolean; onOpenChange: (b: boolean) => void; onPick: (id: string) => void }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => TACO_FOODS.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())).slice(0, 20), [q]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 flex items-center justify-center p-4" onClick={() => onOpenChange(false)}>
      <Card className="bg-card max-w-md w-full p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display font-semibold">Tabela TACO</h3>
        <p className="text-xs text-muted-foreground mb-3">Busque um alimento (valores por 100g).</p>
        <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex: Arroz integral" />
        <ul className="mt-3 max-h-72 overflow-auto space-y-1">
          {results.map((f) => (
            <li key={f.id}>
              <button onClick={() => onPick(f.id)} className="w-full text-left flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition">
                <span className="text-xl">{foodIcon(f.id)}</span>
                <div className="flex-1"><p className="text-sm font-medium">{f.name}</p><p className="text-xs text-muted-foreground">{f.kcal} kcal · C {f.carbs}g · P {f.protein}g · G {f.fat}g</p></div>
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
