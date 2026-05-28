import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "./login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Recuperar senha — Roteiro Nutri" }] }),
  component: ForgotPwd,
});

function ForgotPwd() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => { setSent(true); toast.success("E-mail de recuperação enviado"); }, 600);
  };
  return (
    <AuthLayout>
      {sent ? (
        <div className="text-center">
          <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-3xl font-semibold mt-4">Confira seu e-mail</h1>
          <p className="text-muted-foreground mt-2 text-sm">Enviamos um link de redefinição para <strong>{email}</strong>.</p>
          <Link to="/login"><Button variant="outline" className="mt-6">Voltar ao login</Button></Link>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-semibold">Recuperar senha</h1>
          <p className="text-muted-foreground mt-2 text-sm">Enviaremos um link seguro para o e-mail cadastrado.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <Label>E-mail</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 bg-card" />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-leaf-deep">Enviar link</Button>
            <p className="text-center text-sm"><Link to="/login" className="text-primary hover:underline">Voltar ao login</Link></p>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
