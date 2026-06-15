import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useStore } from "@/lib/mock-store";
import { toast } from "sonner";
import { Leaf } from "lucide-react";

export const Route = createFileRoute("/paciente/login")({
  head: () => ({ meta: [{ title: "Acessar app — Roteiro Nutri" }] }),
  component: PatientLogin,
});

function PatientLogin() {
  const { loginPatient } = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState("ana@email.com");
  const [pwd, setPwd] = useState("demo1234");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const id = loginPatient(email, pwd);
      if (id) {
        toast.success("Bem-vindo(a)!");
        nav({ to: "/app" });
      } else {
        toast.error("Credenciais inválidas ou paciente inativo");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-sand flex">
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-leaf p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-terracotta/30 blur-3xl" />
        <Logo className="h-12 w-auto relative" variant="light" />
        <div className="relative">
          <h2 className="text-4xl font-display font-semibold leading-tight text-balance">
            "Seu plano alimentar, na palma da mão — onde quer que você esteja."
          </h2>
          <p className="mt-4 text-primary-foreground/80">Acompanhe refeições, evolução e conquistas no app.</p>
        </div>
        <div className="relative text-xs text-primary-foreground/70">© Roteiro Nutri</div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 sm:px-6 py-10 sm:py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center"><Logo className="h-12 w-auto" /></div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Leaf className="h-3 w-3" /> App do paciente
          </div>
          <h1 className="text-3xl font-semibold mt-4">Acesse seu plano</h1>
          <p className="text-muted-foreground text-sm mt-2">Use as credenciais fornecidas pelo seu nutricionista.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <Label>E-mail</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 bg-card" />
            </div>
            <div>
              <Label>Senha</Label>
              <Input type="password" required value={pwd} onChange={(e) => setPwd(e.target.value)} className="mt-1.5 bg-card" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-leaf-deep h-12 rounded-xl">
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-4">
              É nutricionista? <Link to="/login" className="text-primary underline">Acessar dashboard</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
