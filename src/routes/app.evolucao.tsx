import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";

export const Route = createFileRoute("/app/evolucao")({
  head: () => ({ meta: [{ title: "Evolução — Roteiro Nutri" }] }),
  component: Evolucao,
});

function Evolucao() {
  const { session, getPatient } = useStore();
  const p = session.patientId ? getPatient(session.patientId) : undefined;
  if (!p) return null;
  const delta = (p.weightKg - p.initialWeightKg).toFixed(1);
  return (
    <div className="px-5 pt-6 space-y-5">
      <div className="flex items-center gap-2">
        <Link to="/app"><ArrowLeft className="h-5 w-5" /></Link>
        <p className="font-semibold flex-1 text-center">Evolução</p>
        <span className="w-5" />
      </div>

      <Card className="p-5 bg-card border-border">
        <p className="text-center text-sm text-muted-foreground">Peso</p>
        <p className="text-center text-4xl font-display font-semibold text-leaf mt-1">{delta} kg</p>
        <p className="text-center text-xs text-muted-foreground">desde o início</p>
        <div className="h-56 mt-4">
          <ResponsiveContainer>
            <LineChart data={p.evolution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} domain={["dataMin - 2", "dataMax + 2"]} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--primary)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground">Peso atual</p>
          <p className="text-2xl font-display font-semibold">{p.weightKg} <span className="text-sm text-muted-foreground">kg</span></p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground">Peso inicial</p>
          <p className="text-2xl font-display font-semibold">{p.initialWeightKg} <span className="text-sm text-muted-foreground">kg</span></p>
        </Card>
      </div>
    </div>
  );
}
