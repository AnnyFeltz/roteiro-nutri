import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, type Patient } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, MoreHorizontal, UserX, Apple } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/nutri/pacientes")({
  head: () => ({ meta: [{ title: "Pacientes — Roteiro Nutri" }] }),
  component: PacientesList,
});

function PacientesList() {
  const { patients, addPatient, deactivatePatient } = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"todos" | "ativos" | "inativos">("ativos");

  const filtered = useMemo(() => {
    return patients
      .filter((p) => (filter === "todos" ? true : filter === "ativos" ? p.active : !p.active))
      .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.email.toLowerCase().includes(q.toLowerCase()));
  }, [patients, q, filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Pacientes</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus pacientes e seus planos.</p>
        </div>
        <NewPatientDialog onCreate={(d) => { addPatient(d); toast.success("Paciente cadastrado"); }} />
      </div>

      <Card className="p-4 bg-card border-border">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou e-mail..." className="pl-9 bg-background" />
          </div>
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(["ativos", "inativos", "todos"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition ${filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="bg-card border-border overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/30">
            <tr className="text-left text-xs font-medium text-muted-foreground">
              <th className="px-5 py-3">Paciente</th>
              <th className="px-3 py-3">Objetivo</th>
              <th className="px-3 py-3">IMC</th>
              <th className="px-3 py-3">Próxima consulta</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => <PatientRow key={p.id} p={p} onDeactivate={() => { deactivatePatient(p.id); toast.success(`${p.name} desativado(a). Plano alimentar suspenso.`); }} />)}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-sm text-muted-foreground">Nenhum paciente encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function PatientRow({ p, onDeactivate }: { p: Patient; onDeactivate: () => void }) {
  const { getActivePlan } = useStore();
  const activePlan = getActivePlan(p.id);
  const versionId = activePlan?.id ?? "new";
  const initials = p.name.split(" ").map((s) => s[0]).slice(0, 2).join("");
  const imc = (p.weightKg / Math.pow(p.heightCm / 100, 2)).toFixed(1);
  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition">
      <td className="px-5 py-4">
        <Link to="/nutri/pacientes/$id" params={{ id: p.id }} className="flex items-center gap-3 group">
          <Avatar className="h-10 w-10"><AvatarFallback style={{ background: p.avatarColor, color: "white" }}>{initials}</AvatarFallback></Avatar>
          <div>
            <p className="font-medium text-sm group-hover:text-primary">{p.name}</p>
            <p className="text-xs text-muted-foreground">{p.age} anos · {p.email}</p>
          </div>
        </Link>
      </td>
      <td className="px-3 py-4 text-sm capitalize">{p.goal}</td>
      <td className="px-3 py-4 text-sm font-mono">{imc}</td>
      <td className="px-3 py-4 text-sm">{p.nextConsult}</td>
      <td className="px-3 py-4">
        {p.active ? <Badge className="bg-primary/15 text-primary border-0">Ativo</Badge> : <Badge variant="outline" className="text-muted-foreground">Inativo</Badge>}
      </td>
      <td className="px-3 py-4 text-right">
        <div className="flex justify-end gap-2">
          <Link to="/nutri/pacientes/$id/plano" params={{ id: p.id }}>
            <Button variant="outline" size="sm" className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary">
              <Apple className="h-3.5 w-3.5" /> Plano alimentar
            </Button>
          </Link>
          <Link to="/nutri/pacientes/$id" params={{ id: p.id }}>
            <Button variant="outline" size="sm">Abrir</Button>
          </Link>
          {p.active && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"><UserX className="h-4 w-4" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Desativar {p.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O plano alimentar ativo será automaticamente suspenso (RN04). O paciente não poderá mais acessar o app.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onDeactivate} className="bg-destructive hover:bg-destructive/90">Desativar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </td>
    </tr>
  );
}

function NewPatientDialog({ onCreate }: { onCreate: (p: any) => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    name: "", email: "", age: 30, sex: "F" as "M" | "F",
    heightCm: 165, weightKg: 65, initialWeightKg: 65, targetWeightKg: 60,
    bodyFatPct: 25, leanMassPct: 75, goal: "emagrecimento" as any,
    status: "Novo" as any, startDate: new Date().toLocaleDateString("pt-BR"),
    nextConsult: "—", lastConsult: "—",
    allergies: "", medicalHistory: "", lifestyle: "", foodRecall: "",
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-leaf-deep gap-2"><Plus className="h-4 w-4" /> Novo paciente</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Cadastrar paciente</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="col-span-2"><Label>Nome completo</Label><Input className="mt-1.5" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div><Label>E-mail</Label><Input className="mt-1.5" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div><Label>Idade</Label><Input className="mt-1.5" type="number" value={f.age} onChange={(e) => setF({ ...f, age: +e.target.value })} /></div>
          <div><Label>Sexo</Label>
            <Select value={f.sex} onValueChange={(v) => setF({ ...f, sex: v as any })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="F">Feminino</SelectItem><SelectItem value="M">Masculino</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label>Objetivo</Label>
            <Select value={f.goal} onValueChange={(v) => setF({ ...f, goal: v })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
                <SelectItem value="saude">Saúde geral</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Altura (cm)</Label><Input className="mt-1.5" type="number" value={f.heightCm} onChange={(e) => setF({ ...f, heightCm: +e.target.value })} /></div>
          <div><Label>Peso atual (kg)</Label><Input className="mt-1.5" type="number" value={f.weightKg} onChange={(e) => setF({ ...f, weightKg: +e.target.value, initialWeightKg: +e.target.value })} /></div>
          <div><Label>Peso alvo (kg)</Label><Input className="mt-1.5" type="number" value={f.targetWeightKg} onChange={(e) => setF({ ...f, targetWeightKg: +e.target.value })} /></div>
          <div className="col-span-2"><Label>Alergias / intolerâncias</Label><Input className="mt-1.5" value={f.allergies} onChange={(e) => setF({ ...f, allergies: e.target.value })} placeholder="Lactose, glúten..." /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button className="bg-primary hover:bg-leaf-deep" onClick={() => { onCreate(f); setOpen(false); }}>Cadastrar paciente</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
