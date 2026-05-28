import { TACO_FOODS, getFood, type TacoFood } from "@/lib/taco-foods";

export function calcFood(food: TacoFood, grams: number) {
  const f = grams / 100;
  return {
    kcal: Math.round(food.kcal * f),
    carbs: +(food.carbs * f).toFixed(1),
    protein: +(food.protein * f).toFixed(1),
    fat: +(food.fat * f).toFixed(1),
  };
}

export function calcMealKcal(foods: { foodId: string; grams: number }[]) {
  return foods.reduce((sum, f) => {
    const food = getFood(f.foodId);
    return food ? sum + calcFood(food, f.grams).kcal : sum;
  }, 0);
}

const ICONS: Record<TacoFood["category"], string> = {
  cereal: "🌾",
  proteina: "🍗",
  fruta: "🍓",
  vegetal: "🥦",
  laticinio: "🥛",
  tuberculo: "🍠",
  gordura: "🥑",
  outro: "🍽️",
};

export function foodIcon(foodId: string) {
  const f = getFood(foodId);
  return f ? ICONS[f.category] : "🍽️";
}

export { TACO_FOODS };
