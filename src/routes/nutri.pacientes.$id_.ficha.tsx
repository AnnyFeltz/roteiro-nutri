import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/mock-store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, ClipboardList } from "lucide-react";
import { bmi, bmiLabel } from "@/lib/nutrition";
import { calcFood, calcMealKcal, foodIcon } from "@/lib/food-utils";
import { getFood } from "@/lib/taco-foods";

export const Route = createFileRoute("/nutri/pacientes/$id_/ficha")({
  head: () => ({ meta: [{ title: "Ficha médica/nutricional — Roteiro Nutri" }] }),
  component: Ficha,
});

function Ficha() {
  const { id } = Route.useParams();
  const { getPatient, getActivePlan, getPlansForPatient, nutritionist } = useStore();
  const p = getPatient(id);
  if (!p) return <div className="text-center py-20 text-muted-foreground">Paciente não encontrado.</div>;

  const imcVal = bmi(p.weightKg, p.heightCm);
  const plan = getActivePlan(p.id) ?? getPlansForPatient(p.id).at(-1);
  const issuedAt = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const deltaW = +(p.weightKg - p.initialWeightKg).toFixed(1);
  const consults = p.consultations ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <Link to="/nutri/pacientes/$id" params={{ id: p.id }} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Voltar ao prontuário
        </Link>
        <Button onClick={() => window.print()} className="bg-primary hover:bg-leaf-deep gap-2">
          <Printer className="h-4 w-4" /> Exportar PDF profissional
        </Button>
      </div>

      <article className="print-page mx-auto bg-white text-zinc-900 shadow-soft border border-border rounded-2xl max-w-[820px] p-10 print:rounded-none print:border-0 print:shadow-none">
        {/* Letterhead */}
        <header className="flex items-start justify-between border-b-2 border-zinc-900 pb-5">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <ClipboardList className="h-6 w-6" />
              <p className="text-xs uppercase tracking-[0.2em] font-semibold">Roteiro Nutri</p>
            </div>
            <h1 className="font-display text-3xl font-semibold mt-2 text-zinc-900">Ficha Médica/Nutricional</h1>
            <p className="text-xs text-zinc-600 mt-1">Documento de acompanhamento clínico-nutricional</p>
          </div>
          <div className="text-right text-xs text-zinc-700">
            <p className="font-medium">{nutritionist.name}</p>
            <p>{nutritionist.crn}</p>
            <p className="mt-1.5">Emitido em {issuedAt}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Prontuário #{p.id.toUpperCase()}</p>
          </div>
        </header>

        {/* Identificação */}
        <Section title="1. Identificação do paciente">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            <KV k="Nome completo" v={p.name} />
            <KV k="E-mail" v={p.email} />
            <KV k="Idade" v={`${p.age} anos`} />
            <KV k="Sexo" v={p.sex === "F" ? "Feminino" : "Masculino"} />
            <KV k="Início do acompanhamento" v={p.startDate} />
            <KV k="Última consulta" v={p.lastConsult} />
            <KV k="Próxima consulta" v={p.nextConsult} />
            <KV k="Status" v={p.active ? "Em acompanhamento" : "Inativo"} />
          </div>
        </Section>

        {/* Anamnese clínica */}
        <Section title="2. Anamnese clínica">
          <KVBlock k="Histórico médico" v={p.medicalHistory || "Não informado."} />
          <KVBlock k="Alergias e intolerâncias" v={p.allergies || "Nenhuma relatada."} />
          <KVBlock k="Estilo de vida e rotina" v={p.lifestyle || "Não informado."} />
          <KVBlock k="Recordatório alimentar (últimas 24h)" v={p.foodRecall || "Não informado."} />
        </Section>

        {/* Avaliação antropométrica */}
        <Section title="3. Avaliação antropométrica">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <Box label="Altura" value={`${p.heightCm} cm`} />
            <Box label="Peso atual" value={`${p.weightKg} kg`} />
            <Box label="Peso inicial" value={`${p.initialWeightKg} kg`} />
            <Box label="Peso alvo" value={`${p.targetWeightKg} kg`} />
            <Box label="IMC" value={`${imcVal.toFixed(1)} (${bmiLabel(imcVal)})`} />
            <Box label="Variação" value={`${deltaW > 0 ? "+" : ""}${deltaW} kg`} />
            <Box label="% Gordura corporal" value={`${p.bodyFatPct}%`} />
            <Box label="% Massa magra" value={`${p.leanMassPct}%`} />
            <Box label="Objetivo" value={p.goal} />
          </div>
        </Section>

        {/* Evolução de peso */}
        <Section title="4. Evolução do peso">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-300 text-left text-xs uppercase tracking-wider text-zinc-600">
                <th className="py-2 pr-3 font-medium">Período</th>
                <th className="py-2 pr-3 font-medium">Peso (kg)</th>
                <th className="py-2 font-medium">Δ vs início</th>
              </tr>
            </thead>
            <tbody>
              {p.evolution.map((e, i) => (
                <tr key={i} className="border-b border-zinc-100">
                  <td className="py-1.5 pr-3">{e.month}</td>
                  <td className="py-1.5 pr-3 font-mono">{e.weight.toFixed(1)}</td>
                  <td className="py-1.5 font-mono">{(e.weight - p.initialWeightKg).toFixed(1)} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Plano alimentar */}
        <Section title="5. Plano alimentar vigente">
          {plan ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm">
                <KV k="Plano" v={`${plan.name} (versão ${plan.id})`} />
                <KV k="Iniciado em" v={plan.createdAt} />
                <KV k="Status" v={plan.active ? "Ativo" : "Suspenso"} />
                <KV k="Meta calórica" v={`${plan.targetKcal} kcal/dia`} />
                <KV k="Macros" v={`C ${plan.macros.carbs}% / P ${plan.macros.protein}% / G ${plan.macros.fat}%`} />
              </div>

              {plan.meals.map((m) => (
                <div key={m.id} className="border border-zinc-300 rounded-md p-3">
                  <div className="flex justify-between items-baseline border-b border-zinc-200 pb-1.5 mb-2">
                    <p className="font-semibold text-sm">{m.name} <span className="text-xs text-zinc-500 font-normal">— {m.time}</span></p>
                    <p className="text-xs font-mono text-zinc-700">{calcMealKcal(m.foods)} kcal</p>
                  </div>
                  <table className="w-full text-xs">
                    <tbody>
                      {m.foods.map((f, i) => {
                        const food = getFood(f.foodId);
                        if (!food) return null;
                        const c = calcFood(food, f.grams);
                        return (
                          <tr key={i} className="border-b border-zinc-100 last:border-0">
                            <td className="py-1 pr-2 w-6">{foodIcon(f.foodId)}</td>
                            <td className="py-1 pr-2">{food.name}</td>
                            <td className="py-1 pr-2 font-mono text-right w-16">{f.grams} g</td>
                            <td className="py-1 pr-2 font-mono text-right w-16">{c.kcal} kcal</td>
                            <td className="py-1 font-mono text-right text-zinc-500 w-32">P {c.protein} · C {c.carbs} · G {c.fat}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 italic">Nenhum plano alimentar cadastrado.</p>
          )}
        </Section>

        {/* Histórico de atendimentos */}
        <Section title="6. Histórico de atendimentos">
          {consults.length === 0 ? (
            <p className="text-sm text-zinc-500 italic">Sem atendimentos registrados.</p>
          ) : (
            <ul className="space-y-2.5 text-sm">
              {consults.map((c) => (
                <li key={c.id} className="border-l-2 border-primary pl-3">
                  <p className="text-xs text-zinc-500"><span className="font-mono">{c.date}</span> · <span className="uppercase tracking-wider">{c.type}</span></p>
                  <p className="mt-0.5 whitespace-pre-wrap">{c.notes}</p>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Conduta / assinatura */}
        <Section title="7. Conduta e observações">
          <p className="text-sm text-zinc-700 leading-relaxed">
            Paciente apresenta evolução compatível com o objetivo de <span className="font-medium">{p.goal}</span>.
            Variação total de <span className="font-mono">{deltaW > 0 ? "+" : ""}{deltaW} kg</span> desde o início do acompanhamento.
            Manter conduta nutricional vigente e reavaliação na próxima consulta ({p.nextConsult}).
          </p>
        </Section>

        <footer className="mt-12 pt-6 border-t border-zinc-300 flex justify-between items-end">
          <div className="text-[10px] text-zinc-500 max-w-sm leading-relaxed">
            Documento gerado eletronicamente pelo Roteiro Nutri.
            Informações sigilosas — uso exclusivo entre profissional e paciente (LGPD Art. 11).
          </div>
          <div className="text-center">
            <div className="border-t border-zinc-900 w-64 pt-1.5">
              <p className="text-sm font-medium">{nutritionist.name}</p>
              <p className="text-[10px] text-zinc-600">{nutritionist.crn}</p>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-xs uppercase tracking-[0.18em] font-semibold text-zinc-500 border-b border-zinc-200 pb-1.5 mb-3">{title}</h2>
      {children}
    </section>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="text-sm capitalize-first">
      <span className="text-zinc-500">{k}: </span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

function KVBlock({ k, v }: { k: string; v: string }) {
  return (
    <div className="mb-2.5">
      <p className="text-xs text-zinc-500 uppercase tracking-wider">{k}</p>
      <p className="text-sm whitespace-pre-wrap mt-0.5">{v}</p>
    </div>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-zinc-300 rounded-md p-2.5">
      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className="font-mono text-sm font-medium capitalize">{value}</p>
    </div>
  );
}
