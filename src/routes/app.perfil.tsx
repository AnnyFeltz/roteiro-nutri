import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, LogOut, AlertTriangle, Target, Ruler, Mail, Phone, CalendarCheck, FileText, Bell, ChevronRight, Shield, Pencil } from "lucide-react";
import { bmi, bmiLabel } from "@/lib/nutrition";

export const Route = createFileRoute("/app/perfil")({
  head: () => ({ meta: [{ title: "Perfil — Roteiro Nutri" }] }),
  component: Perfil,
});

function Perfil() {
  const { session, getPatient, getActivePlan, nutritionist, logout } = useStore();
  const nav = useNavigate();
  const p = session.patientId ? getPatient(session.patientId) : undefined;
  if (!p) return null;
  const initials = p.name.split(" ").map((s) => s[0]).slice(0, 2).join("");
  const imcVal = bmi(p.weightKg, p.heightCm);
  const plan = getActivePlan(p.id);

  return (
    <div className="px-5 pt-6 pb-4 space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/app"><ArrowLeft className="h-5 w-5" /></Link>
        <p className="font-display font-semibold flex-1 text-center">Meu Perfil</p>
        <span className="w-5" />
      </div>

      {/* Hero */}
      <Card className="p-6 bg-gradient-to-br from-primary to-leaf-deep text-primary-foreground border-0 text-center relative overflow-hidden">
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative">
          <Avatar className="h-20 w-20 mx-auto ring-4 ring-white/20"><AvatarFallback style={{ background: p.avatarColor, color: "white" }} className="text-2xl font-display">{initials}</AvatarFallback></Avatar>
          <h2 className="font-display font-semibold text-xl mt-3">{p.name}</h2>
          <p className="text-sm opacity-80">{p.email}</p>
          <div className="flex justify-center gap-2 mt-3">
            <Badge className="bg-white/20 text-primary-foreground border-0 hover:bg-white/30 capitalize">{p.goal}</Badge>
            <Badge className="bg-white/20 text-primary-foreground border-0 hover:bg-white/30">Desde {p.startDate.slice(3)}</Badge>
          </div>
        </div>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <Card className="p-3 bg-card border-border text-center">
          <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Peso</p>
          <p className="font-display font-semibold text-lg">{p.weightKg}<span className="text-xs text-muted-foreground"> kg</span></p>
        </Card>
        <Card className="p-3 bg-card border-border text-center">
          <p className="text-[10px] uppercase text-muted-foreground tracking-wider">IMC</p>
          <p className="font-display font-semibold text-lg">{imcVal.toFixed(1)}</p>
        </Card>
        <Card className="p-3 bg-card border-border text-center">
          <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Meta</p>
          <p className="font-display font-semibold text-lg">{p.targetWeightKg}<span className="text-xs text-muted-foreground"> kg</span></p>
        </Card>
      </div>

      {/* Nutritionist */}
      <Card className="p-4 bg-card border-border">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Sua nutricionista</p>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-semibold">DC</div>
          <div className="flex-1">
            <p className="font-medium">{nutritionist.name}</p>
            <p className="text-xs text-muted-foreground">{nutritionist.crn}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Button variant="outline" size="sm" className="gap-1.5"><Mail className="h-3.5 w-3.5" /> E-mail</Button>
          <Button variant="outline" size="sm" className="gap-1.5"><Phone className="h-3.5 w-3.5" /> Ligar</Button>
        </div>
      </Card>

      {/* Personal data */}
      <Card className="p-4 bg-card border-border">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Dados pessoais</p>
        <ul className="text-sm divide-y divide-border">
          <Row label="Idade" value={`${p.age} anos`} />
          <Row label="Sexo" value={p.sex === "F" ? "Feminino" : "Masculino"} />
          <Row label="Altura" value={`${p.heightCm} cm`} />
          <Row label="Peso atual" value={`${p.weightKg} kg`} />
          <Row label="Classificação" value={bmiLabel(imcVal)} />
        </ul>
      </Card>

      {/* Goals & restrictions */}
      <Card className="p-4 bg-card border-border space-y-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Objetivos e restrições</p>
        <Item icon={<Target className="h-4 w-4 text-primary" />} title="Objetivo" desc={p.goal} />
        <Item icon={<Ruler className="h-4 w-4 text-leaf" />} title="Meta de peso" desc={`${p.targetWeightKg} kg`} />
        <Item icon={<AlertTriangle className="h-4 w-4 text-terracotta" />} title="Alergias e intolerâncias" desc={p.allergies || "Nenhuma"} />
        <Item icon={<Shield className="h-4 w-4 text-foreground/60" />} title="Histórico clínico" desc={p.medicalHistory} />
      </Card>

      {/* Plan info */}
      {plan && (
        <Card className="p-4 bg-card border-border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Plano alimentar atual</p>
          <p className="font-medium">{plan.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Ativo desde {plan.createdAt} · {plan.targetKcal} kcal/dia</p>
        </Card>
      )}

      {/* Appointment */}
      <Card className="p-4 bg-accent/40 border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center"><CalendarCheck className="h-5 w-5" /></div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Próxima consulta</p>
            <p className="font-medium">{p.nextConsult}</p>
          </div>
        </div>
      </Card>

      {/* Settings list */}
      <Card className="p-2 bg-card border-border">
        <SettingsRow icon={<Bell className="h-4 w-4" />} label="Notificações" />
        <SettingsRow icon={<FileText className="h-4 w-4" />} label="Histórico de planos" />
        <SettingsRow icon={<Shield className="h-4 w-4" />} label="Privacidade" />
      </Card>

      <Button variant="outline" className="w-full gap-2" onClick={() => { logout(); nav({ to: "/" }); }}>
        <LogOut className="h-4 w-4" /> Sair
      </Button>
      <p className="text-center text-[10px] text-muted-foreground">Roteiro Nutri · v1.0</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex justify-between py-2.5"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></li>
  );
}

function Item({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-sm capitalize">{desc}</p>
      </div>
    </div>
  );
}

function SettingsRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition text-left">
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 text-sm">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
