import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, Stethoscope, Smartphone, ChartLine, Leaf, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Roteiro Nutri — Gestão Nutricional Inteligente" },
      { name: "description", content: "Plataforma web e mobile para nutricionistas gerenciarem pacientes e planos alimentares personalizados." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-sand">
      <header className="px-6 md:px-12 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <Logo className="h-10 w-auto" />
        <nav className="flex items-center gap-3">
          <Link to="/paciente/login" className="text-sm font-medium text-foreground/70 hover:text-foreground px-3 py-2">
            Sou paciente
          </Link>
          <Link to="/login">
            <Button variant="ghost" className="text-foreground">Entrar</Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-primary hover:bg-leaf-deep">Cadastrar</Button>
          </Link>
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-xs font-medium text-leaf-deep mb-6">
            <Leaf className="h-3.5 w-3.5" /> Plataforma completa para nutricionistas
          </div>
          <h1 className="text-5xl md:text-6xl font-semibold text-foreground leading-[1.05] text-balance">
            A rotina do seu <span className="text-terracotta">consultório</span>, organizada com leveza.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl text-balance">
            Cadastre pacientes, monte planos alimentares personalizados com base na tabela TACO e acompanhe a evolução em um só lugar — no consultório ou no bolso do seu paciente.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup">
              <Button size="lg" className="bg-primary hover:bg-leaf-deep gap-2">
                Começar gratuitamente <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-border">Entrar como nutricionista</Button>
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-leaf" /> Dados criptografados</div>
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-terracotta" /> TACO integrada</div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 bg-gradient-leaf rounded-3xl opacity-10 blur-2xl" />
          <div className="relative grid grid-cols-2 gap-4">
            <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
              <Stethoscope className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-display font-semibold">Dashboard Web</h3>
              <p className="text-sm text-muted-foreground mt-1">Para o nutricionista. CRUD de pacientes, anamnese, planos.</p>
            </div>
            <div className="bg-card rounded-2xl p-5 shadow-soft border border-border mt-8">
              <Smartphone className="h-8 w-8 text-terracotta mb-3" />
              <h3 className="font-display font-semibold">App Mobile</h3>
              <p className="text-sm text-muted-foreground mt-1">Para o paciente. Plano do dia, substituições, evolução.</p>
            </div>
            <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
              <ChartLine className="h-8 w-8 text-leaf mb-3" />
              <h3 className="font-display font-semibold">Evolução</h3>
              <p className="text-sm text-muted-foreground mt-1">Gráficos automáticos de peso, massa magra e adesão.</p>
            </div>
            <div className="bg-card rounded-2xl p-5 shadow-soft border border-border mt-8">
              <Leaf className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-display font-semibold">TACO</h3>
              <p className="text-sm text-muted-foreground mt-1">Base oficial de alimentos brasileiros com macros precisos.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream border-t border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid md:grid-cols-3 gap-6">
          {[
            { kpi: "87", label: "Pacientes ativos" },
            { kpi: "92%", label: "Adesão média ao plano" },
            { kpi: "23", label: "Planos alimentares gerados" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-2xl p-6 border border-border">
              <p className="text-4xl font-display font-semibold text-primary">{s.kpi}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 md:px-12 py-8 text-sm text-muted-foreground flex justify-between">
        <span>© Roteiro Nutri</span>
        <span>Feito com 💚 para nutricionistas</span>
      </footer>
    </div>
  );
}
