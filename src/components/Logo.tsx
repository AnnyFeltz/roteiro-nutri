import logoSrc from "@/assets/logo-roteiro-nutri.png";

export function Logo({ className = "h-10 w-auto", variant = "default" }: { className?: string; variant?: "default" | "light" }) {
  return (
    <img
      src={logoSrc}
      alt="Roteiro Nutri"
      className={className}
      style={variant === "light" ? { filter: "brightness(0) invert(1)", opacity: 0.95 } : undefined}
    />
  );
}
