import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "./login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useStore } from "@/lib/mock-store";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Cadastro — Roteiro Nutri" }] }),
  component: Signup,
});

function Signup() {
  const { signupNutri } = useStore();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", crn: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error("Senha deve ter ao menos 8 caracteres"); return; }
    setLoading(true);
    setTimeout(() => {
      signupNutri(form);
      toast.success("Cadastro realizado!");
      nav({ to: "/nutri" });
    }, 700);
  };

  return (
    <AuthLayout>
      <h1 className="text-3xl font-semibold">Crie sua conta</h1>
      <p className="text-muted-foreground mt-2 text-sm">Comece a organizar seu consultório hoje.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <Label>Nome completo</Label>
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 bg-card" placeholder="Dra. Caroline Madera" />
        </div>
        <div>
          <Label>CRN</Label>
          <Input required value={form.crn} onChange={(e) => setForm({ ...form, crn: e.target.value })} className="mt-1.5 bg-card" placeholder="CRN-8 12345" />
        </div>
        <div>
          <Label>E-mail profissional</Label>
          <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 bg-card" />
        </div>
        <div>
          <Label>Senha</Label>
          <Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1.5 bg-card" placeholder="Mín. 8 caracteres" />
          <p className="text-xs text-muted-foreground mt-1">Senha protegida com hash (bcrypt simulado).</p>
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-leaf-deep">
          {loading ? "Criando conta..." : "Criar conta"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Já tem conta? <Link to="/login" className="text-primary font-medium hover:underline">Entrar</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
