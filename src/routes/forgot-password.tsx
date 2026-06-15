import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "./login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Mail } from "lucide-react";
import { useStore } from "@/lib/mock-store";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Recuperar senha — Roteiro Nutri" }] }),
  component: ForgotPwd,
});

function ForgotPwd() {
  const { nutritionist, requestPatientPasswordReset } = useStore();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"nutri" | "paciente">("nutri");
  const [sent, setSent] = useState<null | { kind: "nutri" | "paciente"; patientName?: string }>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "nutri") {
      setTimeout(() => {
        setSent({ kind: "nutri" });
        toast.success("E-mail de recuperação enviado");
      }, 500);
    } else {
      const r = requestPatientPasswordReset(email);
      if (!r.ok) { toast.error(r.error ?? "Não foi possível enviar"); return; }
      setSent({ kind: "paciente", patientName: r.patientName });
      toast.success("Pedido enviado ao nutricionista");
    }
  };

  return (
    <AuthLayout>
      {sent ? (
        <div className="text-center">
          <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-3xl font-semibold mt-4">
            {sent.kind === "nutri" ? "Confira seu e-mail" : "Pedido enviado"}
          </h1>
          {sent.kind === "nutri" ? (
            <p className="text-muted-foreground mt-2 text-sm">
              Enviamos um link de redefinição para <strong>{email}</strong>.
            </p>
          ) : (
            <div className="text-sm text-muted-foreground mt-3 space-y-2">
              <p>
                Olá{sent.patientName ? `, ${sent.patientName}` : ""}! Seu pedido foi enviado para
                <strong> {nutritionist.name}</strong> ({nutritionist.email}).
              </p>
              <p>
                Assim que ele(a) aprovar, uma nova senha será gerada e enviada para o seu e-mail
                <strong> {email}</strong>.
              </p>
            </div>
          )}
          <Link to="/login"><Button variant="outline" className="mt-6">Voltar ao login</Button></Link>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-semibold">Recuperar senha</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {role === "nutri"
              ? "Enviaremos um link seguro para o e-mail cadastrado."
              : "Seu pedido será enviado ao nutricionista para aprovação. Após aprovado, a nova senha chega no seu e-mail."}
          </p>

          <div className="mt-5 inline-flex rounded-lg border border-border p-1 bg-card">
            <button
              type="button"
              onClick={() => setRole("nutri")}
              className={`text-xs px-3 py-1.5 rounded-md transition ${role === "nutri" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >Sou nutricionista</button>
            <button
              type="button"
              onClick={() => setRole("paciente")}
              className={`text-xs px-3 py-1.5 rounded-md transition ${role === "paciente" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >Sou paciente</button>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label>E-mail</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 bg-card" />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-leaf-deep gap-2">
              <Mail className="h-4 w-4" />
              {role === "nutri" ? "Enviar link" : "Solicitar nova senha"}
            </Button>
            <p className="text-center text-sm">
              <Link to="/login" className="text-primary hover:underline">Voltar ao login</Link>
            </p>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
