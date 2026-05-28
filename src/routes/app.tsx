import { createFileRoute } from "@tanstack/react-router";
import { PatientShell } from "@/components/PatientShell";

export const Route = createFileRoute("/app")({
  component: PatientShell,
});
