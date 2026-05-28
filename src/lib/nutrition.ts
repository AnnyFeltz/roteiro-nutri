// Nutrition calculation helpers — Harris-Benedict & Mifflin-St Jeor

export type Sex = "M" | "F";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "veryActive";
export type Goal = "emagrecimento" | "manutencao" | "hipertrofia" | "saude" | "performance";

const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

export function mifflinStJeor(weight: number, height: number, age: number, sex: Sex) {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return sex === "M" ? base + 5 : base - 161;
}

export function harrisBenedict(weight: number, height: number, age: number, sex: Sex) {
  return sex === "M"
    ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
    : 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
}

export function calcGET(tmb: number, activity: ActivityLevel) {
  return tmb * ACTIVITY_FACTOR[activity];
}

export function adjustForGoal(get: number, goal: Goal) {
  switch (goal) {
    case "emagrecimento":
      return get - 500;
    case "hipertrofia":
      return get + 400;
    case "performance":
      return get + 250;
    default:
      return get;
  }
}

export function macroGrams(kcal: number, pct: { carbs: number; protein: number; fat: number }) {
  return {
    carbs: Math.round((kcal * (pct.carbs / 100)) / 4),
    protein: Math.round((kcal * (pct.protein / 100)) / 4),
    fat: Math.round((kcal * (pct.fat / 100)) / 9),
  };
}

export function bmi(weight: number, heightCm: number) {
  const m = heightCm / 100;
  return weight / (m * m);
}

export function bmiLabel(value: number) {
  if (value < 18.5) return "Abaixo do peso";
  if (value < 25) return "Normal";
  if (value < 30) return "Sobrepeso";
  return "Obesidade";
}
