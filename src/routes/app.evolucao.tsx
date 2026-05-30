import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingDown, TrendingUp, Trophy, Plus, Target } from "lucide-react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { useState } from "react";
import { toast } from "sonner";
import { bmi, bmiLabel } from "@/lib/nutrition";

export const Route = createFileRoute("/app/evolucao")({
  head: () => ({ meta: [{ title: "Evolução — Roteiro Nutri" }] }),
  component: Evolucao,
});

function Evolucao() {
  const { session, getPatient, updatePatient } = useStore();
  const p = session.patientId ? getPatient(session.patientId) : undefined;
  const [adding, setAdding] = useState(false);
  const [newWeight, setNewWeight] = useState("");

  if (!p) return null;
  const delta = +(p.weightKg - p.initialWeightKg).toFixed(1);
  const toTarget = +(p.weightKg - p.targetWeightKg).toFixed(1);
  const progress = Math.round(
    (Math.abs(p.initialWeightKg - p.weightKg) / Math.max(1, Math.abs(p.initialWeightKg - p.targetWeightKg))) * 100
  );
  const isLoss = p.goal === "emagrecimento";
  const Trend = isLoss ? TrendingDown : TrendingUp;
  const imcVal = bmi(p.weightKg, p.heightCm);

  const adherenceSeries = p.evolution.map((e, i) => ({ ...e, adesao: 70 + ((i * 17) % 25) }));

  const logWeight = () => {
    const w = parseFloat(newWeight);
    if (!w || w < 30 || w > 300) { toast.error("Peso inválido"); return; }
    const monthLabel = new Date().toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    updatePatient(p.id, {
      weightKg: w,
      evolution: [...p.evolution, { month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1), weight: w }],
    });
    toast.success("Peso registrado!");
    setAdding(false);
    setNewWeight("");
  };

  return (
    <div className="px-5 pt-6 pb-4 space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/app"><ArrowLeft className="h-5 w-5" /></Link>
        <p className="font-display font-semibold flex-1 text-center">Sua Evolução</p>
        <button onClick={() => setAdding((x) => !x)} className="text-primary"><Plus className="h-5 w-5" /></button>
      </div>

      {adding && (
        <Card className="p-4 bg-accent/30 border-border">
          <p className="text-sm font-medium mb-2">Registrar peso de hoje</p>
          <div className="flex gap-2">
            <Input type="number" step="0.1" placeholder="kg" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} autoFocus />
            <Button onClick={logWeight} className="bg-primary hover:bg-leaf-deep">Salvar</Button>
          </div>
        </Card>
      )}

      {/* Hero metric */}
      <Card className="p-5 bg-card border-border text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
          <Trend className="h-3.5 w-3.5" /> Variação total
        </div>
        <p className={`text-5xl font-display font-semibold mt-1 ${delta < 0 ? "text-leaf" : "text-terracotta"}`}>
          {delta > 0 ? "+" : ""}{delta} <span className="text-xl text-muted-foreground">kg</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">desde {p.startDate}</p>

        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border text-left">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Inicial</p>
            <p className="font-display font-semibold text-lg">{p.initialWeightKg}<span className="text-xs text-muted-foreground"> kg</span></p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Atual</p>
            <p className="font-display font-semibold text-lg text-primary">{p.weightKg}<span className="text-xs text-muted-foreground"> kg</span></p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Meta</p>
            <p className="font-display font-semibold text-lg">{p.targetWeightKg}<span className="text-xs text-muted-foreground"> kg</span></p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
            <span>Progresso até a meta</span>
            <span className="font-medium text-primary">{Math.min(100, Math.max(0, progress))}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-gradient-to-r from-leaf to-primary rounded-full" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">Faltam <strong className="text-foreground">{Math.abs(toTarget)} kg</strong> para sua meta</p>
        </div>
      </Card>

      {/* Weight chart */}
      <Card className="p-5 bg-card border-border">
        <p className="text-sm font-medium mb-3">Histórico de peso</p>
        <div className="h-52">
          <ResponsiveContainer>
            <AreaChart data={p.evolution} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} domain={["dataMin - 2", "dataMax + 2"]} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={2.5} fill="url(#wfill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Body composition */}
      <Card className="p-5 bg-card border-border">
        <p className="text-sm font-medium mb-3">Composição corporal</p>
        <CompBar label="Massa magra" v={p.leanMassPct} color="var(--primary)" />
        <div className="h-2" />
        <CompBar label="Massa gorda" v={p.bodyFatPct} color="var(--terracotta)" />
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">IMC</p>
            <p className="font-display font-semibold text-lg">{imcVal.toFixed(1)}</p>
            <Badge variant="outline" className="text-[10px] mt-0.5">{bmiLabel(imcVal)}</Badge>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Altura</p>
            <p className="font-display font-semibold text-lg">{(p.heightCm / 100).toFixed(2)} m</p>
          </div>
        </div>
      </Card>

      {/* Adherence trend */}
      <Card className="p-5 bg-card border-border">
        <p className="text-sm font-medium mb-3">Adesão ao plano (mensal)</p>
        <div className="h-32">
          <ResponsiveContainer>
            <LineChart data={adherenceSeries} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} domain={[50, 100]} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="adesao" stroke="var(--terracotta)" strokeWidth={2} dot={{ r: 3, fill: "var(--terracotta)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Achievements */}
      <Card className="p-5 bg-card border-border">
        <p className="text-sm font-medium mb-3 flex items-center gap-2"><Trophy className="h-4 w-4 text-terracotta" /> Conquistas</p>
        <ul className="space-y-2">
          {[
            { i: "🔥", t: "7 dias de sequência", d: "Adesão completa esta semana" },
            { i: "🎯", t: `${Math.abs(delta)} kg ${delta < 0 ? "perdidos" : "ganhos"}`, d: "Mantendo o ritmo!" },
            { i: "🥇", t: "Primeira meta atingida", d: "50% do caminho até o objetivo" },
          ].map((a, i) => (
            <li key={i} className="flex items-center gap-3 p-3 rounded-xl bg-accent/30">
              <span className="text-2xl">{a.i}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{a.t}</p>
                <p className="text-[11px] text-muted-foreground">{a.d}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-4 bg-primary/5 border-primary/30">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Próxima consulta</p>
            <p className="text-xs text-muted-foreground">{p.nextConsult}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function CompBar({ label, v, color }: { label: string; v: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{v}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${v}%`, background: color }} />
      </div>
    </div>
  );
}
