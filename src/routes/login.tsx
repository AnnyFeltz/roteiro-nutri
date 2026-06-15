import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useStore } from "@/lib/mock-store";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Roteiro Nutri" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { loginNutri } = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState("caroline@roteironutri.com");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (loginNutri(email, password)) {
        toast.success("Bem-vinda de volta!");
        nav({ to: "/nutri" });
      } else {
        toast.error("Credenciais inválidas");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <AuthLayout>
      <h1 className="text-3xl font-semibold text-foreground">Bem-vinda de volta</h1>
      <p className="text-muted-foreground mt-2 text-sm">Entre para acessar seu consultório.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5 bg-card" />
        </div>
        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="pwd">Senha</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">Esqueci minha senha</Link>
          </div>
          <Input id="pwd" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1.5 bg-card" />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-leaf-deep">
          {loading ? "Entrando..." : "Entrar"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Ainda não tem conta? <Link to="/signup" className="text-primary font-medium hover:underline">Cadastre-se</Link>
        </p>
        <p className="text-center text-xs text-muted-foreground/70">
          É paciente? <Link to="/paciente/login" className="underline">Entrar como paciente</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-sand flex">
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-leaf p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-terracotta/30 blur-3xl" />
        <div className="self-start"><Logo className="h-12 w-auto relative" variant="light" /></div>
        <div className="relative">
          <h2 className="text-4xl font-display font-semibold leading-tight text-balance">
            "Centralize sua rotina e foque no que importa: cuidar de cada paciente."
          </h2>
          <p className="mt-4 text-primary-foreground/80">Plataforma completa de gestão nutricional.</p>
        </div>
        <div className="relative text-xs text-primary-foreground/70">© Roteiro Nutri</div>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center"><Logo className="h-10" /></div>
          {children}
        </div>
      </div>
    </div>
  );
}
