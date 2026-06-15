import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Flame, Activity } from "lucide-react";

export const Route = createFileRoute("/app/perfil/historico")({
  head: () => ({ meta: [{ title: "Histórico de planos — Roteiro Nutri" }] }),
  component: Historico,
});

function Historico() {
  const { session, getPlansForPatient } = useStore();
  const list = session.patientId ? getPlansForPatient(session.patientId) : [];
  const sorted = [...list].sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1));

  return (
    <div className="px-5 pt-6 pb-4 space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/app/perfil"><ArrowLeft className="h-5 w-5" /></Link>
        <p className="font-display font-semibold flex-1 text-center">Histórico de planos</p>
        <span className="w-5" />
      </div>

      {sorted.length === 0 && (
        <Card className="p-8 bg-card border-border text-center text-sm text-muted-foreground">
          Nenhum plano cadastrado ainda.
        </Card>
      )}

      <div className="space-y-3">
        {sorted.map((p) => (
          <Card key={p.id} className="p-4 bg-card border-border">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium truncate">{p.name}</p>
                  {p.active
                    ? <Badge className="bg-primary/15 text-primary border-0">Ativo</Badge>
                    : <Badge variant="outline">Encerrado</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Versão {p.id} · iniciado em {p.createdAt}</p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Flame className="h-3 w-3" /> {p.targetKcal} kcal/dia</span>
                  <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> {p.meals.length} refeições</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
