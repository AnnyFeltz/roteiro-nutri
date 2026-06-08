import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/nutri/agenda")({
  head: () => ({ meta: [{ title: "Agenda — Roteiro Nutri" }] }),
  component: () => <Outlet />,
});
