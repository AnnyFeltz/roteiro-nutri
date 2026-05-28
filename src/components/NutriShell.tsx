import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, ClipboardList, Apple, TrendingUp, FileText, Settings, LogOut, Bell, Search } from "lucide-react";
import { Logo } from "./Logo";
import { useStore } from "@/lib/mock-store";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect } from "react";

const NAV: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/nutri", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/nutri/pacientes", label: "Pacientes", icon: Users },
  { to: "/nutri/agenda", label: "Agenda", icon: ClipboardList },
  { to: "/nutri/anamnese", label: "Anamnese", icon: FileText },
  { to: "/nutri/planos", label: "Planos Alimentares", icon: Apple },
  { to: "/nutri/taco", label: "Alimentos (TACO)", icon: Apple },
  { to: "/nutri/evolucao", label: "Evolução", icon: TrendingUp },
  { to: "/nutri/relatorios", label: "Relatórios", icon: FileText },
  { to: "/nutri/configuracoes", label: "Configurações", icon: Settings },
];

export function NutriShell() {
  const { session, nutritionist, logout } = useStore();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (session.role !== "nutricionista") nav({ to: "/login" });
  }, [session.role, nav]);

  if (session.role !== "nutricionista") return null;

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-sidebar-border">
          <Logo className="h-9 w-auto" variant="light" />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active = item.exact ? path === item.to : path.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to as any}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <Avatar className="h-9 w-9 ring-2 ring-sidebar-primary/40">
              <AvatarFallback className="bg-terracotta text-terracotta-foreground text-xs font-semibold">DC</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{nutritionist.name}</p>
              <p className="text-xs text-sidebar-foreground/60">Nutricionista</p>
            </div>
            <button
              onClick={() => { logout(); nav({ to: "/" }); }}
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
          <div className="flex items-center gap-4 px-8 py-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar paciente..." className="pl-9 bg-card border-border rounded-full" />
            </div>
            <button className="relative p-2 rounded-full hover:bg-muted">
              <Bell className="h-5 w-5 text-foreground/70" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-terracotta" />
            </button>
          </div>
        </header>
        <div className="px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
