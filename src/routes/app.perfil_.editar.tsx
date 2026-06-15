import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/perfil_/editar")({
  head: () => ({ meta: [{ title: "Editar perfil — Roteiro Nutri" }] }),
  component: EditPerfil,
});

function EditPerfil() {
  const { session, getPatient, updatePatientByPatient } = useStore();
  const nav = useNavigate();
  const p = session.patientId ? getPatient(session.patientId) : undefined;
  const [form, setForm] = useState({ name: p?.name ?? "", email: p?.email ?? "" });

  if (!p) return null;

  const save = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Preencha nome e e-mail");
      return;
    }
    updatePatientByPatient(p.id, { name: form.name.trim(), email: form.email.trim() });
    toast.success("Perfil atualizado. Sua nutri foi notificada.");
    nav({ to: "/app/perfil" });
  };

  return (
    <div className="px-5 pt-6 pb-4 space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/app/perfil"><ArrowLeft className="h-5 w-5" /></Link>
        <p className="font-display font-semibold flex-1 text-center">Editar perfil</p>
        <span className="w-5" />
      </div>

      <Card className="p-4 bg-accent/30 border-border flex gap-3">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Você pode editar suas informações pessoais. Dados nutricionais (peso, altura, objetivo, restrições) só podem ser ajustados pela sua nutricionista em consulta.
        </p>
      </Card>

      <Card className="p-5 bg-card border-border space-y-4">
        <div>
          <Label>Nome completo</Label>
          <Input className="mt-1.5" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <Label>E-mail</Label>
          <Input className="mt-1.5" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
      </Card>

      <Card className="p-5 bg-muted/40 border-border space-y-3 opacity-70">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Dados nutricionais (somente leitura)</p>
        <ReadOnly label="Peso atual" value={`${p.weightKg} kg`} />
        <ReadOnly label="Altura" value={`${p.heightCm} cm`} />
        <ReadOnly label="Objetivo" value={p.goal} />
        <ReadOnly label="Meta de peso" value={`${p.targetWeightKg} kg`} />
        <ReadOnly label="Alergias" value={p.allergies || "Nenhuma"} />
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => nav({ to: "/app/perfil" })}>Cancelar</Button>
        <Button className="flex-1 bg-primary hover:bg-leaf-deep" onClick={save}>Salvar</Button>
      </div>
    </div>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}
