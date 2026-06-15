import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, Apple, CalendarCheck, MessageSquare, Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/perfil/notificacoes")({
  head: () => ({ meta: [{ title: "Notificações — Roteiro Nutri" }] }),
  component: Notificacoes,
});

const ITEMS = [
  { key: "meals", icon: Apple, title: "Lembretes de refeição", desc: "Receba avisos nos horários do seu plano." },
  { key: "consult", icon: CalendarCheck, title: "Próximas consultas", desc: "Lembrete 24h antes do atendimento." },
  { key: "msg", icon: MessageSquare, title: "Mensagens da nutri", desc: "Avisos quando sua nutri enviar algo." },
  { key: "achv", icon: Trophy, title: "Conquistas", desc: "Quando atingir metas ou marcos." },
  { key: "weekly", icon: Bell, title: "Resumo semanal", desc: "Receba um resumo da sua semana toda segunda." },
];

function Notificacoes() {
  const [state, setState] = useState<Record<string, boolean>>({ meals: true, consult: true, msg: true, achv: true, weekly: false });

  const toggle = (k: string) => {
    setState((s) => ({ ...s, [k]: !s[k] }));
    toast.success("Preferência salva");
  };

  return (
    <div className="px-5 pt-6 pb-4 space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/app/perfil"><ArrowLeft className="h-5 w-5" /></Link>
        <p className="font-display font-semibold flex-1 text-center">Notificações</p>
        <span className="w-5" />
      </div>

      <Card className="p-2 bg-card border-border">
        {ITEMS.map((it, i) => {
          const Icon = it.icon;
          return (
            <div key={it.key} className={`flex items-center gap-3 p-3 ${i < ITEMS.length - 1 ? "border-b border-border" : ""}`}>
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{it.title}</p>
                <p className="text-xs text-muted-foreground">{it.desc}</p>
              </div>
              <Switch checked={state[it.key]} onCheckedChange={() => toggle(it.key)} />
            </div>
          );
        })}
      </Card>

      <p className="text-center text-[11px] text-muted-foreground">As notificações são enviadas pelo app e por e-mail.</p>
    </div>
  );
}
