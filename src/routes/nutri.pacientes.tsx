import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/nutri/pacientes")({
  component: () => <Outlet />,
});
