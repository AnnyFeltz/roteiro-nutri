import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/nutri/agenda")({
  head: () => ({ meta: [{ title: "Agenda — Roteiro Nutri" }] }),
  component: AgendaLayout,
});

function AgendaLayout() {
  // Render either the index calendar or the day detail child.
  const matches = useRouterState({ select: (s) => s.matches });
  const isChild = matches.some((m) => m.routeId !== "/nutri/agenda" && m.routeId.startsWith("/nutri/agenda"));
  if (isChild) return <Outlet />;
  // Fallback: render index inline via Outlet (TanStack will mount /nutri/agenda/ if present)
  return <Outlet />;
}
