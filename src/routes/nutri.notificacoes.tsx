import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Trash2, CheckCheck, User, KeyRound, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/nutri/notificacoes")({
  head: () => ({ meta: [{ title: "Notificações — Roteiro Nutri" }] }),
  component: Notificacoes,
});

const FIELD_LABEL: Record<string, string> = { name: "Nome", email: "E-mail" };

function Notificacoes() {
  const {
    patientUpdates, patients, markUpdatesRead, clearUpdates,
    passwordResets, approvePasswordReset, denyPasswordReset,
  } = useStore();
  const [sentEmail, setSentEmail] = useState<{ to: string; pwd: string } | null>(null);

  useEffect(() => { markUpdatesRead(); }, []); // eslint-disable-line

  const list = [...patientUpdates].sort((a, b) => b.at.localeCompare(a.at));
  const pendingResets = passwordResets.filter((r) => r.status === "pendente");
  const recentResets = passwordResets.filter((r) => r.status !== "pendente").slice(0, 5);

  const onApprove = (id: string) => {
    const r = approvePasswordReset(id);
    if (r.ok && r.email && r.newPassword) {
      setSentEmail({ to: r.email, pwd: r.newPassword });
      toast.success(`Nova senha gerada e enviada para ${r.email}`);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> Notificações
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pedidos de redefinição de senha e alterações de perfil dos pacientes.
          </p>
        </div>
        {list.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearUpdates} className="gap-2">
            <Trash2 className="h-4 w-4" /> Limpar atualizações
          </Button>
        )}
      </div>

      {/* Pending password reset requests */}
      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <KeyRound className="h-4 w-4" /> Pedidos de nova senha ({pendingResets.length})
        </h2>
        {pendingResets.length === 0 ? (
          <Card className="p-5 bg-card border-border text-sm text-muted-foreground">
            Nenhum pedido pendente.
          </Card>
        ) : (
          pendingResets.map((r) => {
            const p = patients.find((x) => x.id === r.patientId);
            return (
              <Card key={r.id} className="p-4 bg-card border-border">
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{p?.name ?? "Paciente"}</p>
                    <p className="text-xs text-muted-foreground">{p?.email}</p>
                    <p className="text-sm mt-1">
                      Solicitou uma nova senha. Ao aprovar, geramos automaticamente e enviamos por e-mail.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(r.at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { denyPasswordReset(r.id); toast.success("Pedido negado"); }} className="gap-1">
                      <X className="h-4 w-4" /> Negar
                    </Button>
                    <Button size="sm" onClick={() => onApprove(r.id)} className="bg-primary hover:bg-leaf-deep gap-1">
                      <Check className="h-4 w-4" /> Aprovar e enviar
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}

        {sentEmail && (
          <Card className="p-4 bg-primary/5 border-primary/30 border-dashed">
            <p className="text-xs uppercase tracking-wider text-primary font-semibold">📧 E-mail enviado (simulação)</p>
            <p className="text-sm mt-2">
              <span className="text-muted-foreground">Para:</span> <span className="font-medium">{sentEmail.to}</span>
            </p>
            <p className="text-sm mt-1">
              <span className="text-muted-foreground">Nova senha:</span>{" "}
              <code className="px-2 py-0.5 rounded bg-background border border-border font-mono">{sentEmail.pwd}</code>
            </p>
            <button onClick={() => setSentEmail(null)} className="text-xs text-muted-foreground hover:text-foreground mt-3">
              Fechar
            </button>
          </Card>
        )}

        {recentResets.length > 0 && (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer py-2">Pedidos recentes resolvidos</summary>
            <ul className="space-y-1 mt-1">
              {recentResets.map((r) => {
                const p = patients.find((x) => x.id === r.patientId);
                return (
                  <li key={r.id} className="flex justify-between gap-3 border-b border-border py-1.5">
                    <span>{p?.name ?? "—"}</span>
                    <Badge variant="outline" className="text-[10px]">{r.status}</Badge>
                  </li>
                );
              })}
            </ul>
          </details>
        )}
      </section>

      {/* Patient profile updates */}
      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Alterações de perfil ({list.length})
        </h2>
        {list.length === 0 ? (
          <Card className="p-8 bg-card border-border text-center">
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
      </section>
    </div>
  );
}
