import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, LogOut, AlertTriangle, Target, Ruler } from "lucide-react";
import { bmi, bmiLabel } from "@/lib/nutrition";

export const Route = createFileRoute("/app/perfil")({
  head: () => ({ meta: [{ title: "Perfil — Roteiro Nutri" }] }),
  component: Perfil,
});

function Perfil() {
  const { session, getPatient, logout } = useStore();
  const nav = useNavigate();
  const p = session.patientId ? getPatient(session.patientId) : undefined;
  if (!p) return null;
  const initials = p.name.split(" ").map((s) => s[0]).slice(0, 2).join("");
  const imcVal = bmi(p.weightKg, p.heightCm);
  return (
    <div className="px-5 pt-6 space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/app"><ArrowLeft className="h-5 w-5" /></Link>
        <p className="font-semibold flex-1 text-center">Perfil</p>
        <span className="w-5" />
      </div>

      <Card className="p-5 bg-card border-border text-center">
        <Avatar className="h-20 w-20 mx-auto"><AvatarFallback style={{ background: p.avatarColor, color: "white" }} className="text-xl">{initials}</AvatarFallback></Avatar>
        <h2 className="font-display font-semibold text-xl mt-3">{p.name}</h2>
        <p className="text-sm text-muted-foreground">{p.email}</p>
      </Card>

      <Card className="p-4 bg-card border-border">
        <h3 className="text-xs font-medium text-muted-foreground uppercase mb-2">Dados pessoais</h3>
        <ul className="text-sm divide-y divide-border">
          <li className="flex justify-between py-2"><span className="text-muted-foreground">Idade</span><span>{p.age} anos</span></li>
          <li className="flex justify-between py-2"><span className="text-muted-foreground">Sexo</span><span>{p.sex === "F" ? "Feminino" : "Masculino"}</span></li>
          <li className="flex justify-between py-2"><span className="text-muted-foreground">Altura</span><span>{p.heightCm} cm</span></li>
          <li className="flex justify-between py-2"><span className="text-muted-foreground">Peso atual</span><span>{p.weightKg} kg</span></li>
          <li className="flex justify-between py-2"><span className="text-muted-foreground">IMC</span><span>{imcVal.toFixed(1)} ({bmiLabel(imcVal)})</span></li>
        </ul>
      </Card>

      <Card className="p-4 bg-card border-border">
        <h3 className="text-xs font-medium text-muted-foreground uppercase mb-2">Objetivos e restrições</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2"><Target className="h-4 w-4 text-primary mt-0.5" /><span className="capitalize">{p.goal}</span></li>
          <li className="flex items-start gap-2"><Ruler className="h-4 w-4 text-leaf mt-0.5" /><span>Meta: {p.targetWeightKg} kg</span></li>
          <li className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-terracotta mt-0.5" /><span>Alergias: {p.allergies || "Nenhuma"}</span></li>
        </ul>
      </Card>

      <Card className="p-4 bg-card border-border">
        <h3 className="text-xs font-medium text-muted-foreground uppercase mb-2">Histórico clínico</h3>
        <p className="text-sm">{p.medicalHistory}</p>
      </Card>

      <Button variant="outline" className="w-full gap-2" onClick={() => { logout(); nav({ to: "/" }); }}>
        <LogOut className="h-4 w-4" /> Sair
      </Button>
    </div>
  );
}
