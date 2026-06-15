import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Trash2, CheckCheck, User } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/nutri/notificacoes")({
  head: () => ({ meta: [{ title: "Notificações — Roteiro Nutri" }] }),
  component: Notificacoes,
});

const FIELD_LABEL: Record<string, string> = {
  name: "Nome",
  email: "E-mail",
};

function Notificacoes() {
  const { patientUpdates, patients, markUpdatesRead, clearUpdates } = useStore();

  useEffect(() => { markUpdatesRead(); }, []); // eslint-disable-line

  const list = [...patientUpdates].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> Notificações
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Alterações feitas pelos pacientes no perfil.</p>
        </div>
        {list.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearUpdates} className="gap-2">
            <Trash2 className="h-4 w-4" /> Limpar tudo
          </Button>
        )}
      </div>

      {list.length === 0 ? (
        <Card className="p-12 bg-card border-border text-center">
          <CheckCheck className="h-10 w-10 text-primary/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma notificação no momento.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {list.map((u) => {
            const p = patients.find((x) => x.id === u.patientId);
            return (
              <Card key={u.id} className="p-4 bg-card border-border">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link to="/nutri/pacientes/$id" params={{ id: u.patientId }} className="font-medium hover:underline">
                        {p?.name ?? "Paciente"}
                      </Link>
                      <Badge variant="outline" className="text-[10px]">{FIELD_LABEL[u.field] ?? u.field}</Badge>
                    </div>
                    <p className="text-sm mt-1">
                      Alterou <span className="font-medium">{FIELD_LABEL[u.field] ?? u.field}</span>:{" "}
                      <span className="line-through text-muted-foreground">{u.oldValue}</span> →{" "}
                      <span className="font-medium text-primary">{u.newValue}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(u.at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
