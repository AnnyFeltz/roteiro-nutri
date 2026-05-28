// Mock TACO (Tabela Brasileira de Composição de Alimentos) — values per 100g
export interface TacoFood {
  id: string;
  name: string;
  category: "cereal" | "proteina" | "fruta" | "vegetal" | "laticinio" | "tuberculo" | "gordura" | "outro";
  kcal: number;
  carbs: number; // g
  protein: number; // g
  fat: number; // g
  fiber?: number;
}

export const TACO_FOODS: TacoFood[] = [
  { id: "arroz-integral", name: "Arroz integral cozido", category: "cereal", kcal: 124, carbs: 25.8, protein: 2.6, fat: 1, fiber: 2.7 },
  { id: "arroz-branco", name: "Arroz branco cozido", category: "cereal", kcal: 128, carbs: 28.1, protein: 2.5, fat: 0.2 },
  { id: "feijao-carioca", name: "Feijão carioca cozido", category: "proteina", kcal: 76, carbs: 13.6, protein: 4.8, fat: 0.5, fiber: 8.5 },
  { id: "feijao-preto", name: "Feijão preto cozido", category: "proteina", kcal: 77, carbs: 14, protein: 4.5, fat: 0.5 },
  { id: "batata-doce", name: "Batata doce cozida", category: "tuberculo", kcal: 77, carbs: 18.4, protein: 0.6, fat: 0.1, fiber: 2.2 },
  { id: "mandioca", name: "Mandioca cozida", category: "tuberculo", kcal: 125, carbs: 30.1, protein: 0.6, fat: 0.3 },
  { id: "peito-frango", name: "Peito de frango grelhado", category: "proteina", kcal: 159, carbs: 0, protein: 32, fat: 3 },
  { id: "patinho-bovino", name: "Patinho bovino grelhado", category: "proteina", kcal: 219, carbs: 0, protein: 35.9, fat: 7.3 },
  { id: "ovo-cozido", name: "Ovo de galinha cozido", category: "proteina", kcal: 146, carbs: 0.6, protein: 13.3, fat: 9.5 },
  { id: "tilapia", name: "Tilápia grelhada", category: "proteina", kcal: 128, carbs: 0, protein: 26.2, fat: 2.7 },
  { id: "salmao", name: "Salmão grelhado", category: "proteina", kcal: 208, carbs: 0, protein: 20.4, fat: 13.4 },
  { id: "iogurte-natural", name: "Iogurte natural integral", category: "laticinio", kcal: 51, carbs: 4.1, protein: 4.1, fat: 1.5 },
  { id: "iogurte-grego", name: "Iogurte grego", category: "laticinio", kcal: 96, carbs: 4, protein: 9, fat: 5 },
  { id: "queijo-cottage", name: "Queijo cottage", category: "laticinio", kcal: 98, carbs: 3.4, protein: 11, fat: 4.3 },
  { id: "leite-desnatado", name: "Leite desnatado", category: "laticinio", kcal: 34, carbs: 4.8, protein: 3.4, fat: 0.2 },
  { id: "banana-prata", name: "Banana prata", category: "fruta", kcal: 98, carbs: 26.0, protein: 1.3, fat: 0.1, fiber: 2 },
  { id: "maca", name: "Maçã com casca", category: "fruta", kcal: 56, carbs: 15.2, protein: 0.3, fat: 0 },
  { id: "mamao", name: "Mamão papaia", category: "fruta", kcal: 40, carbs: 10.4, protein: 0.5, fat: 0.1 },
  { id: "morango", name: "Morango", category: "fruta", kcal: 30, carbs: 6.8, protein: 0.9, fat: 0.3 },
  { id: "melao", name: "Melão", category: "fruta", kcal: 29, carbs: 7.5, protein: 0.7, fat: 0.1 },
  { id: "abacate", name: "Abacate", category: "fruta", kcal: 96, carbs: 6, protein: 1.2, fat: 8.4 },
  { id: "pao-integral", name: "Pão integral", category: "cereal", kcal: 253, carbs: 49.9, protein: 9.4, fat: 3.7 },
  { id: "aveia", name: "Aveia em flocos", category: "cereal", kcal: 394, carbs: 66.6, protein: 13.9, fat: 8.5 },
  { id: "tapioca", name: "Tapioca", category: "cereal", kcal: 240, carbs: 59, protein: 0, fat: 0 },
  { id: "brocolis", name: "Brócolis cozido", category: "vegetal", kcal: 25, carbs: 4.4, protein: 2.1, fat: 0.4 },
  { id: "alface", name: "Alface", category: "vegetal", kcal: 11, carbs: 1.7, protein: 1.4, fat: 0.2 },
  { id: "tomate", name: "Tomate", category: "vegetal", kcal: 15, carbs: 3.1, protein: 1.1, fat: 0.2 },
  { id: "azeite", name: "Azeite de oliva extra virgem", category: "gordura", kcal: 884, carbs: 0, protein: 0, fat: 100 },
  { id: "castanha-para", name: "Castanha do Pará", category: "gordura", kcal: 643, carbs: 15.1, protein: 14.5, fat: 63.5 },
  { id: "pudim-chia", name: "Pudim de chia", category: "outro", kcal: 165, carbs: 18, protein: 5, fat: 8 },
  { id: "vitamina-frutas", name: "Vitamina de frutas", category: "outro", kcal: 180, carbs: 32, protein: 6, fat: 3 },
];

export const getFood = (id: string) => TACO_FOODS.find((f) => f.id === id);
