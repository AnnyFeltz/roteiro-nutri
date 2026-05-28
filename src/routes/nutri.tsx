import { createFileRoute } from "@tanstack/react-router";
import { NutriShell } from "@/components/NutriShell";

export const Route = createFileRoute("/nutri")({
  component: NutriShell,
});
