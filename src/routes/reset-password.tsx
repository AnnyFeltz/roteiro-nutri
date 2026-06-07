import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "./login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Redefinir senha — Roteiro Nutri" }] }),
  component: ResetPwd,
});

function ResetPwd() {
  const nav = useNavigate();
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 8) { toast.error("A senha deve ter ao menos 8 caracteres"); return; }
    if (pwd !== confirm) { toast.error("As senhas não conferem"); return; }
    setDone(true);
    toast.success("Senha redefinida com sucesso");
    setTimeout(() => nav({ to: "/login" }), 1200);
  };

  return (
    <AuthLayout>
      {done ? (
        <div className="text-center">
          <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-3xl font-semibold mt-4">Senha redefinida</h1>
          <p className="text-muted-foreground mt-2 text-sm">Você já pode entrar com a nova senha.</p>
          <Link to="/login"><Button className="mt-6 bg-primary hover:bg-leaf-deep">Ir para login</Button></Link>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-semibold">Redefinir senha</h1>
          <p className="text-muted-foreground mt-2 text-sm">Escolha uma nova senha segura para sua conta.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <Label>Nova senha</Label>
              <Input type="password" required value={pwd} onChange={(e) => setPwd(e.target.value)} className="mt-1.5 bg-card" />
              <p className="text-xs text-muted-foreground mt-1">Mínimo 8 caracteres.</p>
            </div>
            <div>
              <Label>Confirmar nova senha</Label>
              <Input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1.5 bg-card" />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-leaf-deep">Redefinir senha</Button>
            <p className="text-center text-sm"><Link to="/login" className="text-primary hover:underline">Voltar ao login</Link></p>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
