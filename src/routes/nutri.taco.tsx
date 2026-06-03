import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Apple, Database, Flame, Beef, Wheat, Droplet } from "lucide-react";
import { TACO_FOODS, type TacoFood } from "@/lib/taco-foods";
import { foodIcon } from "@/lib/food-utils";

export const Route = createFileRoute("/nutri/taco")({
  head: () => ({ meta: [{ title: "Tabela TACO — Roteiro Nutri" }] }),
  component: TacoBrowser,
});

const CATS: { value: TacoFood["category"] | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "cereal", label: "Cereais" },
  { value: "proteina", label: "Proteínas" },
  { value: "fruta", label: "Frutas" },
  { value: "vegetal", label: "Vegetais" },
  { value: "laticinio", label: "Laticínios" },
  { value: "tuberculo", label: "Tubérculos" },
  { value: "gordura", label: "Gorduras" },
  { value: "outro", label: "Outros" },
];

function TacoBrowser() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATS)[number]["value"]>("todos");
  const [selected, setSelected] = useState<TacoFood | null>(null);

  const results = useMemo(
    () =>
      TACO_FOODS.filter(
        (f) =>
          (cat === "todos" || f.category === cat) &&
          f.name.toLowerCase().includes(q.toLowerCase()),
      ),
    [q, cat],
  );

  const stats = useMemo(
    () => ({
      total: TACO_FOODS.length,
      cats: new Set(TACO_FOODS.map((f) => f.category)).size,
      avgKcal: Math.round(
        TACO_FOODS.reduce((s, f) => s + f.kcal, 0) / TACO_FOODS.length,
      ),
    }),
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-semibold flex items-center gap-2">
            <Database className="h-7 w-7 text-primary" /> Tabela TACO
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tabela Brasileira de Composição de Alimentos — valores por 100g.
          </p>
        </div>
        <div className="flex gap-3">
          <Card className="px-4 py-2.5 bg-card border-border">
            <p className="text-xs text-muted-foreground">Alimentos</p>
            <p className="text-xl font-display font-semibold text-primary">{stats.total}</p>
          </Card>
          <Card className="px-4 py-2.5 bg-card border-border">
            <p className="text-xs text-muted-foreground">Categorias</p>
            <p className="text-xl font-display font-semibold">{stats.cats}</p>
          </Card>
          <Card className="px-4 py-2.5 bg-card border-border">
            <p className="text-xs text-muted-foreground">Kcal média</p>
            <p className="text-xl font-display font-semibold">{stats.avgKcal}</p>
          </Card>
        </div>
      </div>

      <Card className="p-4 bg-card border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar alimento (ex: arroz, frango, banana...)"
            className="pl-9 bg-background"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {CATS.map((c) => (
            <Button
              key={c.value}
              size="sm"
              variant={cat === c.value ? "default" : "outline"}
              className={cat === c.value ? "bg-primary hover:bg-leaf-deep" : ""}
              onClick={() => setCat(c.value)}
            >
              {c.label}
            </Button>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-[1fr_360px] gap-5">
        <Card className="bg-card border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Alimento</th>
                <th className="text-right px-3 py-3 font-medium">Kcal</th>
                <th className="text-right px-3 py-3 font-medium">Carb</th>
                <th className="text-right px-3 py-3 font-medium">Prot</th>
                <th className="text-right px-4 py-3 font-medium">Gord</th>
              </tr>
            </thead>
            <tbody>
              {results.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => setSelected(f)}
                  className={`border-t border-border cursor-pointer transition-colors ${
                    selected?.id === f.id ? "bg-primary/5" : "hover:bg-muted/30"
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{foodIcon(f.id)}</span>
                      <div>
                        <p className="font-medium">{f.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{f.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-right px-3 py-2.5 font-mono">{f.kcal}</td>
                  <td className="text-right px-3 py-2.5 font-mono text-muted-foreground">{f.carbs}g</td>
                  <td className="text-right px-3 py-2.5 font-mono text-muted-foreground">{f.protein}g</td>
                  <td className="text-right px-4 py-2.5 font-mono text-muted-foreground">{f.fat}g</td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-sm text-muted-foreground">
                    Nenhum alimento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <div className="lg:sticky lg:top-24 self-start">
          {selected ? (
            <Card className="p-5 bg-card border-border space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-4xl">{foodIcon(selected.id)}</span>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-lg leading-tight">{selected.name}</h3>
                  <Badge variant="secondary" className="mt-1.5 capitalize">{selected.category}</Badge>
                </div>
              </div>

              <div className="text-center py-3 border-y border-border">
                <p className="text-xs text-muted-foreground">Energia por 100g</p>
                <p className="text-3xl font-display font-semibold text-primary flex items-center justify-center gap-1.5">
                  <Flame className="h-5 w-5" /> {selected.kcal} <span className="text-base text-muted-foreground font-normal">kcal</span>
                </p>
              </div>

              <div className="space-y-2.5">
                <MacroRow icon={<Wheat className="h-4 w-4" />} color="var(--chart-3)" label="Carboidratos" value={selected.carbs} />
                <MacroRow icon={<Beef className="h-4 w-4" />} color="var(--primary)" label="Proteínas" value={selected.protein} />
                <MacroRow icon={<Droplet className="h-4 w-4" />} color="var(--terracotta)" label="Gorduras" value={selected.fat} />
                {selected.fiber !== undefined && (
                  <MacroRow icon={<Apple className="h-4 w-4" />} color="var(--leaf)" label="Fibras" value={selected.fiber} />
                )}
              </div>

              <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                ID: <span className="font-mono">{selected.id}</span>
              </p>
            </Card>
          ) : (
            <Card className="p-8 bg-card border-border text-center text-sm text-muted-foreground">
              <Database className="h-10 w-10 mx-auto mb-3 opacity-40" />
              Selecione um alimento para ver os detalhes nutricionais.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function MacroRow({ icon, color, label, value }: { icon: React.ReactNode; color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: `color-mix(in oklab, ${color} 15%, transparent)`, color }}>
        {icon}
      </div>
      <span className="text-sm flex-1">{label}</span>
      <span className="font-mono font-medium">{value}g</span>
    </div>
  );
}
