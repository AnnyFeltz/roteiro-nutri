import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Lock } from "lucide-react";

export const Route = createFileRoute("/app/conquistas")({
  head: () => ({ meta: [{ title: "Conquistas — Roteiro Nutri" }] }),
  component: Conquistas,
});

function Conquistas() {
  const { session, getPatient, getActivePlan } = useStore();
  const p = session.patientId ? getPatient(session.patientId) : undefined;
  if (!p) return null;

  const plan = getActivePlan(p.id);
  const delta = +(p.weightKg - p.initialWeightKg).toFixed(1);
  const lost = Math.abs(delta);
  const progress = Math.round(
    (Math.abs(p.initialWeightKg - p.weightKg) / Math.max(1, Math.abs(p.initialWeightKg - p.targetWeightKg))) * 100
  );
  const meals = plan?.meals.length ?? 0;
  const adesao = plan?.adherenceLog.today?.length ?? 0;

  const all: { i: string; t: string; d: string; got: boolean; cat: string }[] = [
    { i: "🌱", t: "Primeira semana", d: "Completou os primeiros 7 dias", got: true, cat: "Início" },
    { i: "📋", t: "Primeira anamnese", d: "Avaliação inicial feita", got: true, cat: "Início" },
    { i: "🍽️", t: "Plano ativo", d: "Possui um plano alimentar em curso", got: !!plan, cat: "Plano" },
    { i: "🔥", t: "7 dias de sequência", d: "Adesão completa esta semana", got: true, cat: "Adesão" },
    { i: "✅", t: "Refeição do dia", d: `Marcou ${adesao} refeições hoje`, got: adesao > 0, cat: "Adesão" },
    { i: "📈", t: "30 dias de uso", d: "Um mês de acompanhamento", got: true, cat: "Engajamento" },
    { i: "🎯", t: `${lost} kg de variação`, d: "Mantendo o ritmo!", got: lost > 0, cat: "Evolução" },
    { i: "🥇", t: "50% até a meta", d: "Metade do caminho percorrido", got: progress >= 50, cat: "Evolução" },
    { i: "🏆", t: "Meta atingida", d: "Chegou na meta de peso", got: progress >= 100, cat: "Evolução" },
    { i: "💧", t: "Hidratação completa", d: "2L de água por 5 dias seguidos", got: true, cat: "Hábitos" },
    { i: "🥗", t: "Saladeiro", d: "10 saladas marcadas no plano", got: meals > 3, cat: "Hábitos" },
    { i: "🌅", t: "Madrugador", d: "Café da manhã antes das 9h por 14 dias", got: true, cat: "Hábitos" },
    { i: "🧘", t: "Equilíbrio", d: "Adesão > 80% por 4 semanas", got: false, cat: "Adesão" },
    { i: "💪", t: "Constância de ouro", d: "100 dias de acompanhamento", got: false, cat: "Engajamento" },
    { i: "👑", t: "Mentor de hábitos", d: "1 ano completo no Roteiro Nutri", got: false, cat: "Engajamento" },
  ];

  const got = all.filter((a) => a.got);
  const locked = all.filter((a) => !a.got);

  return (
    <div className="px-5 pt-6 pb-4 space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/app/evolucao"><ArrowLeft className="h-5 w-5" /></Link>
        <p className="font-display font-semibold flex-1 text-center">Conquistas</p>
        <span className="w-5" />
      </div>

      <Card className="p-5 bg-gradient-to-br from-terracotta to-leaf-deep text-white border-0 text-center">
        <Trophy className="h-8 w-8 mx-auto mb-2" />
        <p className="font-display text-3xl font-semibold">{got.length}<span className="text-lg opacity-70">/{all.length}</span></p>
        <p className="text-xs opacity-90 mt-1">conquistas desbloqueadas</p>
      </Card>

      <section className="space-y-2">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground px-1">Desbloqueadas ({got.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {got.map((a, i) => (
            <Card key={i} className="p-3 bg-card border-border flex items-center gap-3">
              <span className="text-2xl">{a.i}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{a.t}</p>
                <p className="text-[11px] text-muted-foreground truncate">{a.d}</p>
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0">{a.cat}</Badge>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground px-1">A conquistar ({locked.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {locked.map((a, i) => (
            <Card key={i} className="p-3 bg-muted/30 border-border flex items-center gap-3 opacity-70">
              <div className="relative">
                <span className="text-2xl grayscale">{a.i}</span>
                <Lock className="h-3 w-3 text-muted-foreground absolute -bottom-0.5 -right-0.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{a.t}</p>
                <p className="text-[11px] text-muted-foreground truncate">{a.d}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
