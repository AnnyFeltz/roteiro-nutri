import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Plus, FileText, ChevronRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { bmi, bmiLabel } from "@/lib/nutrition";
import { useState } from "react";
import { toast } from "sonner";
import { calcFood, foodIcon, calcMealKcal } from "@/lib/food-utils";
import { getFood } from "@/lib/taco-foods";

export const Route = createFileRoute("/nutri/pacientes/$id")({
  head: () => ({ meta: [{ title: "Prontuário — Roteiro Nutri" }] }),
  component: PatientDetail,
});

function PatientDetail() {
  const { id } = Route.useParams();
  const { getPatient, getActivePlan, updatePatient } = useStore();
  const nav = useNavigate();
  const p = getPatient(id);

  if (!p) return <div className="text-center py-20 text-muted-foreground">Paciente não encontrado.</div>;

  const initials = p.name.split(" ").map((s) => s[0]).slice(0, 2).join("");
  const imcVal = bmi(p.weightKg, p.heightCm);
  const plan = getActivePlan(p.id);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm">
        <Link to="/nutri/pacientes" className="text-muted-foreground hover:text-foreground flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Pacientes</Link>
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
        <span className="text-foreground font-medium">{p.name}</span>
      </div>

      <Card className="p-6 bg-card border-border">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16"><AvatarFallback style={{ background: p.avatarColor, color: "white" }} className="text-lg">{initials}</AvatarFallback></Avatar>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-semibold">{p.name}</h1>
                {p.active ? <Badge className="bg-primary/15 text-primary border-0">Paciente ativo</Badge> : <Badge variant="outline">Inativo</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{p.age} anos · {(p.heightCm / 100).toFixed(2)} m · {p.weightKg} kg · IMC {imcVal.toFixed(1)} ({bmiLabel(imcVal)})</p>
            </div>
          </div>
          <div className="flex gap-2">
           <Link to="/nutri/pacientes/$id/plano/editar{$versionId}" params={{ id: p.id, versionId: plan?.id ?? "new" }}>
             <Button className="bg-primary hover:bg-leaf-deep gap-2"><Plus className="h-4 w-4" /> {plan ? "Editar plano" : "Novo plano"}</Button>
           </Link>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="resumo">
        <TabsList className="bg-card border border-border h-auto p-1 flex-wrap">
          {["resumo", "anamnese", "avaliacao", "plano", "evolucao", "consultas"].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="resumo" className="mt-5">
          <ResumoTab p={p} plan={plan} />
        </TabsContent>

        <TabsContent value="anamnese" className="mt-5">
          <AnamneseTab p={p} onSave={(data: any) => { updatePatient(p.id, data); toast.success("Anamnese atualizada"); }} />
        </TabsContent>

        <TabsContent value="avaliacao" className="mt-5">
          <AvaliacaoTab p={p} imcVal={imcVal} />
        </TabsContent>

        <TabsContent value="plano" className="mt-5">
          <PlanoTab p={p} plan={plan} onEdit={() => nav({ to: "/nutri/pacientes/$id/plano/editar{$versionId}", params: { id: p.id, versionId: plan?.id ?? "new" } })} />
        </TabsContent>

        <TabsContent value="evolucao" className="mt-5">
          <EvolucaoTab p={p} />
        </TabsContent>

        <TabsContent value="consultas" className="mt-5">
          <Card className="p-6 bg-card border-border">
            <h3 className="font-display font-semibold mb-4">Histórico de atendimentos</h3>
            <ul className="space-y-3">
              {[
                { d: "28/05/2024", t: "Retorno", n: "Ajuste no plano alimentar. Adesão de 92%." },
                { d: "12/03/2024", t: "Avaliação inicial", n: "Início do acompanhamento. Plano de emagrecimento criado." },
              ].map((c, i) => (
                <li key={i} className="flex gap-4 p-4 rounded-xl border border-border">
                  <div className="text-sm font-mono text-muted-foreground w-24">{c.d}</div>
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-1">{c.t}</Badge>
                    <p className="text-sm">{c.n}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ResumoTab({ p, plan }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Card className="p-5 bg-card border-border">
        <h4 className="text-sm text-muted-foreground mb-3">Objetivo</h4>
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">🎯</span>
          <p className="font-medium capitalize">{p.goal}</p>
        </div>
        <div className="mt-5 space-y-1 text-sm">
          <p><span className="text-muted-foreground">Início do acompanhamento:</span> {p.startDate}</p>
          {plan && <p className="mt-2"><span className="text-muted-foreground">Plano atual:</span><br /><span className="font-medium">{plan.name}</span><br /><span className="text-xs text-muted-foreground">Iniciado em {plan.createdAt}</span></p>}
        </div>
      </Card>

      <Card className="p-5 bg-card border-border lg:col-span-2">
        <h4 className="text-sm text-muted-foreground mb-3">Dados principais</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Stat label="Peso atual" value={`${p.weightKg} kg`} />
          <Stat label="Peso inicial" value={`${p.initialWeightKg} kg`} />
          <Stat label="Peso alvo" value={`${p.targetWeightKg} kg`} />
          <Stat label="IMC atual" value={bmi(p.weightKg, p.heightCm).toFixed(1)} sub={bmiLabel(bmi(p.weightKg, p.heightCm))} />
          <Stat label="% Gordura" value={`${p.bodyFatPct}%`} />
          <Stat label="% Massa magra" value={`${p.leanMassPct}%`} />
        </div>
      </Card>

      <Card className="p-5 bg-card border-border lg:col-span-2">
        <h4 className="text-sm text-muted-foreground mb-3">Resumo do plano atual</h4>
        {plan ? (
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Calorias diárias</span><span className="font-medium">{plan.targetKcal} kcal</span></li>
            <li className="flex justify-between"><span>Proteínas</span><span className="font-medium">{Math.round(plan.targetKcal * plan.macros.protein / 100 / 4)} g ({plan.macros.protein}%)</span></li>
            <li className="flex justify-between"><span>Carboidratos</span><span className="font-medium">{Math.round(plan.targetKcal * plan.macros.carbs / 100 / 4)} g ({plan.macros.carbs}%)</span></li>
            <li className="flex justify-between"><span>Gorduras</span><span className="font-medium">{Math.round(plan.targetKcal * plan.macros.fat / 100 / 9)} g ({plan.macros.fat}%)</span></li>
          </ul>
        ) : <p className="text-sm text-muted-foreground">Nenhum plano ativo. Crie um plano alimentar para este paciente.</p>}
      </Card>

      <Card className="p-5 bg-card border-border">
        <h4 className="text-sm text-muted-foreground mb-3">Próxima consulta</h4>
        <p className="text-2xl font-display font-semibold text-primary">{p.nextConsult}</p>
        <p className="text-xs text-muted-foreground mt-1">Última: {p.lastConsult}</p>
      </Card>
    </div>
  );
}

function AnamneseTab({ p, onSave }: any) {
  const [d, setD] = useState({
    goal: p.goal, allergies: p.allergies, medicalHistory: p.medicalHistory, lifestyle: p.lifestyle, foodRecall: p.foodRecall,
  });
  return (
    <Card className="p-6 bg-card border-border space-y-5">
      <h3 className="font-display font-semibold text-lg">Anamnese</h3>
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <Label>Objetivo</Label>
          <Input className="mt-1.5" value={d.goal} onChange={(e) => setD({ ...d, goal: e.target.value as any })} />
        </div>
        <div>
          <Label>Alergias e intolerâncias</Label>
          <Input className="mt-1.5" value={d.allergies} onChange={(e) => setD({ ...d, allergies: e.target.value })} />
        </div>
      </div>
      <div>
        <Label>Histórico médico</Label>
        <Textarea className="mt-1.5 min-h-[100px]" value={d.medicalHistory} onChange={(e) => setD({ ...d, medicalHistory: e.target.value })} />
      </div>
      <div>
        <Label>Estilo de vida e rotina</Label>
        <Textarea className="mt-1.5 min-h-[100px]" value={d.lifestyle} onChange={(e) => setD({ ...d, lifestyle: e.target.value })} />
      </div>
      <div>
        <Label>Recordatório alimentar (últimas 24h)</Label>
        <Textarea className="mt-1.5 min-h-[120px]" value={d.foodRecall} onChange={(e) => setD({ ...d, foodRecall: e.target.value })} />
      </div>
      <div className="flex justify-end">
        <Button className="bg-primary hover:bg-leaf-deep" onClick={() => onSave(d)}>Salvar anamnese</Button>
      </div>
    </Card>
  );
}

function AvaliacaoTab({ p, imcVal }: any) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Stat label="Peso atual" value={`${p.weightKg} kg`} large />
      <Stat label="IMC" value={imcVal.toFixed(1)} sub={bmiLabel(imcVal)} large />
      <Stat label="% Gordura corporal" value={`${p.bodyFatPct}%`} large />
      <Stat label="% Massa magra" value={`${p.leanMassPct}%`} large />
      <Stat label="Altura" value={`${p.heightCm} cm`} large />
      <Stat label="Peso alvo" value={`${p.targetWeightKg} kg`} large />
    </div>
  );
}

function PlanoTab({ p, plan, onEdit }: any) {
  if (!plan) return (
    <Card className="p-10 text-center bg-card border-border">
      <p className="text-muted-foreground">Este paciente não possui plano alimentar ativo.</p>
      <Button onClick={onEdit} className="mt-4 bg-primary hover:bg-leaf-deep">Criar plano</Button>
    </Card>
  );

  const macroData = [
    { name: "Carbs", v: plan.macros.carbs, color: "var(--chart-3)" },
    { name: "Proteínas", v: plan.macros.protein, color: "var(--primary)" },
    { name: "Gorduras", v: plan.macros.fat, color: "var(--terracotta)" },
  ];

  return (
    <div className="space-y-5">
      <Card className="p-6 bg-card border-border">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-display font-semibold text-lg">{plan.name}</h3>
            <p className="text-sm text-muted-foreground">Plano ativo · iniciado em {plan.createdAt}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.success("PDF gerado (simulação)")} className="gap-2"><FileText className="h-4 w-4" /> Exportar PDF</Button>
            <Button onClick={onEdit} className="bg-primary hover:bg-leaf-deep">Editar plano</Button>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mt-5">
          <div className="md:col-span-1">
            <div className="relative h-40">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={macroData} dataKey="v" innerRadius={45} outerRadius={70}>
                    {macroData.map((m, i) => <Cell key={i} fill={m.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-2xl font-display font-semibold">{plan.targetKcal}</p>
                <p className="text-xs text-muted-foreground">kcal</p>
              </div>
            </div>
            <ul className="text-xs space-y-1 mt-2">
              {macroData.map((m) => (
                <li key={m.name} className="flex justify-between"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: m.color }} />{m.name}</span><span>{m.v}%</span></li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2 space-y-3">
            {plan.meals.map((m: any) => (
              <div key={m.id} className="border border-border rounded-xl p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.time}</p>
                  </div>
                  <p className="text-sm font-mono text-primary">{calcMealKcal(m.foods)} kcal</p>
                </div>
                <ul className="mt-2 space-y-1">
                  {m.foods.map((f: any, i: number) => {
                    const food = getFood(f.foodId);
                    return food ? (
                      <li key={i} className="text-sm flex justify-between text-muted-foreground">
                        <span>{foodIcon(f.foodId)} {food.name} · {f.grams}g</span>
                        <span>{calcFood(food, f.grams).kcal} kcal</span>
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function EvolucaoTab({ p }: any) {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex justify-between items-baseline mb-4">
        <h3 className="font-display font-semibold text-lg">Evolução do peso</h3>
        <p className="text-sm"><span className="text-leaf font-semibold">{(p.weightKg - p.initialWeightKg).toFixed(1)} kg</span> <span className="text-muted-foreground">desde o início</span></p>
      </div>
      <div className="h-72">
        <ResponsiveContainer>
          <LineChart data={p.evolution} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} domain={["dataMin - 2", "dataMax + 2"]} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
            <Line type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--primary)" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function Stat({ label, value, sub, large }: { label: string; value: string; sub?: string; large?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-background/50 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-display font-semibold mt-1 ${large ? "text-3xl" : "text-2xl"}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
