import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/nutri/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Roteiro Nutri" }] }),
  component: Configuracoes,
});

function Configuracoes() {
  const { nutritionist } = useStore();
  const [name, setName] = useState(nutritionist.name);
  const [email, setEmail] = useState(nutritionist.email);
  const [crn, setCrn] = useState(nutritionist.crn);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-display font-semibold">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie seu perfil e preferências.</p>
      </div>

      <Card className="p-5 sm:p-6 bg-card border-border space-y-4">
        <h2 className="font-display font-semibold">Perfil profissional</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label>Nome</Label><Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>CRN</Label><Input className="mt-1.5" value={crn} onChange={(e) => setCrn(e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>E-mail</Label><Input className="mt-1.5" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        </div>
        <Button className="bg-primary hover:bg-leaf-deep" onClick={() => toast.success("Perfil atualizado")}>Salvar alterações</Button>
      </Card>

      <Card className="p-5 sm:p-6 bg-card border-border space-y-4">
        <h2 className="font-display font-semibold">Notificações</h2>
        <div className="flex items-center justify-between">
          <div><p className="text-sm font-medium">E-mail de consultas</p><p className="text-xs text-muted-foreground">Receba lembretes de consultas agendadas.</p></div>
          <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
        </div>
        <div className="flex items-center justify-between">
          <div><p className="text-sm font-medium">Notificações push</p><p className="text-xs text-muted-foreground">Avisos no navegador para novos eventos.</p></div>
          <Switch checked={notifPush} onCheckedChange={setNotifPush} />
        </div>
      </Card>
    </div>
  );
}
