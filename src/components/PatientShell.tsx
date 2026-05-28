import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, UtensilsCrossed, TrendingUp, User as UserIcon } from "lucide-react";
import { useStore } from "@/lib/mock-store";
import { useEffect } from "react";

const TABS: { to: string; label: string; icon: typeof Home; exact?: boolean }[] = [
  { to: "/app", label: "Início", icon: Home, exact: true },
  { to: "/app/plano", label: "Plano", icon: UtensilsCrossed },
  { to: "/app/evolucao", label: "Evolução", icon: TrendingUp },
  { to: "/app/perfil", label: "Perfil", icon: UserIcon },
];

export function PatientShell() {
  const { session } = useStore();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (session.role !== "paciente") nav({ to: "/paciente/login" });
  }, [session.role, nav]);

  if (session.role !== "paciente") return null;

  return (
    <div className="min-h-screen bg-gradient-sand flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-cream shadow-soft relative flex flex-col">
        <div className="flex-1 pb-24">
          <Outlet />
        </div>
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border z-20">
          <div className="grid grid-cols-4 px-2 py-2 pb-[env(safe-area-inset-bottom)]">
            {TABS.map((t) => {
              const active = t.exact ? path === t.to : path.startsWith(t.to);
              const Icon = t.icon;
              return (
                <Link
                  key={t.to}
                  to={t.to as any}
                  className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "stroke-[2.4]" : ""}`} />
                  <span className="text-[11px] font-medium">{t.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
