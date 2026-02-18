export enum Mesurement {
  KG = "kg",
  G = "g",
  L = "l",
  UNIT = "unit",
  TSP = "tsp",
  TBSP = "tbsp",
}

export interface IngredientBase {
  name: string;
  unit: Mesurement;
  category?: string; // id of the category
  total_quantity: string;
}

export interface IngredientCreate extends IngredientBase {
  // No additional fields needed for creation
}

export interface Ingredient extends IngredientBase {
  id: string;
  created_at: string;
}