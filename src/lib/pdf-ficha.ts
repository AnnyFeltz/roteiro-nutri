import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Patient, MealPlan, Nutritionist } from "./mock-store";
import { bmi, bmiLabel } from "./nutrition";
import { calcFood, calcMealKcal } from "./food-utils";
import { getFood } from "./taco-foods";

const PRIMARY: [number, number, number] = [76, 124, 89]; // leaf
const INK: [number, number, number] = [24, 24, 27];
const MUTED: [number, number, number] = [110, 110, 115];
const LINE: [number, number, number] = [210, 210, 215];

export function exportFichaPDF(p: Patient, plan: MealPlan | undefined, nutri: Nutritionist) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = margin;

  const issuedAt = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  // ---------- Header / Letterhead ----------
  doc.setFillColor(...PRIMARY);
  doc.rect(margin, y, 4, 44, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...PRIMARY);
  doc.text("ROTEIRO NUTRI", margin + 14, y + 14);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...INK);
  doc.text("Ficha Médica/Nutricional", margin + 14, y + 32);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("Documento de acompanhamento clínico-nutricional", margin + 14, y + 44);

  // Right block
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.text(nutri.name, pageW - margin, y + 14, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text(nutri.crn, pageW - margin, y + 26, { align: "right" });
  doc.text(`Emitido em ${issuedAt}`, pageW - margin, y + 38, { align: "right" });
  doc.setFontSize(8);
  doc.text(`Prontuário #${p.id.toUpperCase()}`, pageW - margin, y + 48, { align: "right" });

  y += 60;
  doc.setDrawColor(...INK);
  doc.setLineWidth(1.2);
  doc.line(margin, y, pageW - margin, y);
  y += 18;

  // ---------- Helpers ----------
  const ensure = (h: number) => {
    if (y + h > pageH - margin - 30) {
      addFooter();
      doc.addPage();
      y = margin;
    }
  };

  const sectionTitle = (n: number, t: string) => {
    ensure(28);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...PRIMARY);
    doc.text(`${n}. ${t}`, margin, y);
    y += 6;
    doc.setDrawColor(...PRIMARY);
    doc.setLineWidth(0.6);
    doc.line(margin, y, margin + 40, y);
    y += 14;
    doc.setTextColor(...INK);
  };

  const kvGrid = (rows: [string, string][]) => {
    const colW = (pageW - margin * 2) / 2;
    doc.setFontSize(9);
    rows.forEach((_, i) => {
      if (i % 2 === 0) ensure(18);
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = margin + col * colW;
      const yy = y + row * 16;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MUTED);
      doc.text(rows[i][0], x, yy);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...INK);
      const val = String(rows[i][1] ?? "—");
      doc.text(val, x + 110, yy, { maxWidth: colW - 115 });
    });
    y += Math.ceil(rows.length / 2) * 16 + 6;
  };

  const block = (label: string, text: string) => {
    const t = text || "Não informado.";
    const lines = doc.splitTextToSize(t, pageW - margin * 2);
    ensure(14 + lines.length * 12);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...MUTED);
    doc.text(label.toUpperCase(), margin, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...INK);
    doc.text(lines, margin, y);
    y += lines.length * 12 + 6;
  };

  const addFooter = () => {
    const fy = pageH - margin + 8;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.5);
    doc.line(margin, fy - 14, pageW - margin, fy - 14);
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Documento gerado eletronicamente pelo Roteiro Nutri · Informação sigilosa LGPD Art. 11",
      margin, fy
    );
    const page = doc.getNumberOfPages();
    doc.text(`Página ${page}`, pageW - margin, fy, { align: "right" });
  };

  // ---------- 1. Identificação ----------
  sectionTitle(1, "Identificação do paciente");
  kvGrid([
    ["Nome completo", p.name],
    ["E-mail", p.email],
    ["Idade", `${p.age} anos`],
    ["Sexo", p.sex === "F" ? "Feminino" : "Masculino"],
    ["Início do acompanhamento", p.startDate],
    ["Última consulta", p.lastConsult],
    ["Próxima consulta", p.nextConsult],
    ["Status", p.active ? "Em acompanhamento" : "Inativo"],
  ]);

  // ---------- 2. Anamnese ----------
  sectionTitle(2, "Anamnese clínica");
  block("Histórico médico", p.medicalHistory);
  block("Alergias e intolerâncias", p.allergies);
  block("Estilo de vida e rotina", p.lifestyle);
  block("Recordatório alimentar (24h)", p.foodRecall);

  // ---------- 3. Antropométrica ----------
  sectionTitle(3, "Avaliação antropométrica");
  const imcVal = bmi(p.weightKg, p.heightCm);
  const deltaW = +(p.weightKg - p.initialWeightKg).toFixed(1);
  kvGrid([
    ["Altura", `${p.heightCm} cm`],
    ["Peso atual", `${p.weightKg} kg`],
    ["Peso inicial", `${p.initialWeightKg} kg`],
    ["Peso alvo", `${p.targetWeightKg} kg`],
    ["IMC", `${imcVal.toFixed(1)} (${bmiLabel(imcVal)})`],
    ["Variação", `${deltaW > 0 ? "+" : ""}${deltaW} kg`],
    ["% Gordura corporal", `${p.bodyFatPct}%`],
    ["% Massa magra", `${p.leanMassPct}%`],
    ["Objetivo", p.goal],
  ]);

  // ---------- 4. Evolução ----------
  sectionTitle(4, "Evolução do peso");
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Período", "Peso (kg)", "Δ vs início"]],
    body: p.evolution.map((e) => [
      e.month,
      e.weight.toFixed(1),
      `${(e.weight - p.initialWeightKg).toFixed(1)} kg`,
    ]),
    styles: { font: "helvetica", fontSize: 9, cellPadding: 5, textColor: INK },
    headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 248, 245] },
    theme: "grid",
  });
  // @ts-ignore
  y = (doc as any).lastAutoTable.finalY + 16;

  // ---------- 5. Plano alimentar ----------
  sectionTitle(5, "Plano alimentar vigente");
  if (!plan) {
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "italic");
    doc.text("Nenhum plano alimentar cadastrado.", margin, y);
    y += 16;
  } else {
    kvGrid([
      ["Plano", `${plan.name} (v.${plan.id})`],
      ["Iniciado em", plan.createdAt],
      ["Status", plan.active ? "Ativo" : "Suspenso"],
      ["Meta calórica", `${plan.targetKcal} kcal/dia`],
      ["Carboidratos", `${plan.macros.carbs}%`],
      ["Proteínas", `${plan.macros.protein}%`],
      ["Gorduras", `${plan.macros.fat}%`],
      ["Total de refeições", String(plan.meals.length)],
    ]);

    plan.meals.forEach((m) => {
      const body = m.foods
        .map((f) => {
          const food = getFood(f.foodId);
          if (!food) return null;
          const c = calcFood(food, f.grams);
          return [
            food.name,
            `${f.grams} g`,
            `${c.kcal} kcal`,
            `P ${c.protein} · C ${c.carbs} · G ${c.fat}`,
          ];
        })
        .filter(Boolean) as string[][];

      ensure(40);
      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [[
          `${m.name} — ${m.time}`,
          "Quantidade",
          "Energia",
          `Total: ${calcMealKcal(m.foods)} kcal`,
        ]],
        body,
        styles: { font: "helvetica", fontSize: 8.5, cellPadding: 4, textColor: INK },
        headStyles: {
          fillColor: [240, 244, 238], textColor: PRIMARY, fontStyle: "bold", halign: "left",
        },
        columnStyles: {
          1: { halign: "right" }, 2: { halign: "right" },
          3: { halign: "right", textColor: MUTED },
        },
        theme: "grid",
      });
      // @ts-ignore
      y = (doc as any).lastAutoTable.finalY + 10;
    });
  }

  // ---------- 6. Histórico de atendimentos ----------
  sectionTitle(6, "Histórico de atendimentos");
  const consults = p.consultations ?? [];
  if (consults.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "italic");
    doc.text("Sem atendimentos registrados.", margin, y);
    y += 16;
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Data", "Horário", "Tipo", "Notas"]],
      body: consults.map((c: any) => [c.date, c.time ?? "—", c.type, c.notes]),
      styles: { font: "helvetica", fontSize: 9, cellPadding: 5, textColor: INK, valign: "top" },
      headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 70 }, 1: { cellWidth: 55 }, 2: { cellWidth: 80 },
      },
      theme: "grid",
    });
    // @ts-ignore
    y = (doc as any).lastAutoTable.finalY + 16;
  }

  // ---------- 7. Conduta ----------
  sectionTitle(7, "Conduta e observações");
  const conduta =
    `Paciente apresenta evolução compatível com o objetivo de ${p.goal}. ` +
    `Variação total de ${deltaW > 0 ? "+" : ""}${deltaW} kg desde o início do acompanhamento. ` +
    `Manter conduta nutricional vigente e reavaliação na próxima consulta (${p.nextConsult}).`;
  const lines = doc.splitTextToSize(conduta, pageW - margin * 2);
  ensure(lines.length * 12 + 60);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...INK);
  doc.text(lines, margin, y);
  y += lines.length * 12 + 40;

  // Signature
  ensure(60);
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.6);
  const sigX = pageW - margin - 220;
  doc.line(sigX, y, pageW - margin, y);
  y += 12;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(nutri.name, sigX + 110, y, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.setFontSize(8);
  doc.text(nutri.crn, sigX + 110, y + 11, { align: "center" });

  // Footer on every page
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    addFooter();
  }

  const filename = `ficha-${p.name.toLowerCase().replace(/\s+/g, "-")}-${new Date()
    .toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
