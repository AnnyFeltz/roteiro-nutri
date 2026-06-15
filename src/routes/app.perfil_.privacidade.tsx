import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Eye, Share2, Download, Trash2, FileLock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/perfil_/privacidade")({
  head: () => ({ meta: [{ title: "Privacidade — Roteiro Nutri" }] }),
  component: Privacidade,
});

const ITEMS = [
  { key: "share", icon: Share2, title: "Compartilhar evolução", desc: "Permitir que a nutri compartilhe gráficos anônimos como referência." },
  { key: "analytics", icon: Eye, title: "Métricas de uso", desc: "Ajude-nos a melhorar enviando dados de uso anônimos." },
  { key: "research", icon: FileLock, title: "Participar de pesquisas", desc: "Receber convites para estudos acadêmicos." },
];

function Privacidade() {
  const [state, setState] = useState<Record<string, boolean>>({ share: true, analytics: false, research: false });
  const toggle = (k: string) => { setState((s) => ({ ...s, [k]: !s[k] })); toast.success("Preferência salva"); };

  return (
    <div className="px-5 pt-6 pb-4 space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/app/perfil"><ArrowLeft className="h-5 w-5" /></Link>
        <p className="font-display font-semibold flex-1 text-center">Privacidade</p>
        <span className="w-5" />
      </div>

      <Card className="p-4 bg-accent/30 border-border flex gap-3">
        <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Seus dados de saúde são confidenciais e visíveis apenas para você e sua nutricionista. Conforme a LGPD.
        </p>
      </Card>

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

      <Card className="p-4 bg-card border-border space-y-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Seus dados</p>
        <Button variant="outline" className="w-full justify-start gap-2" onClick={() => toast.success("Pedido recebido. Enviaremos por e-mail em até 48h.")}>
          <Download className="h-4 w-4" /> Baixar meus dados
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive" onClick={() => toast("Solicite à sua nutri o encerramento da conta.")}>
          <Trash2 className="h-4 w-4" /> Excluir minha conta
        </Button>
      </Card>

      <p className="text-center text-[11px] text-muted-foreground">Última atualização da política: 15/06/2026</p>
    </div>
  );
}
