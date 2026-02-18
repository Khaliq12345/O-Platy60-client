import type { Ingredient } from "./ingredient";

export enum Measurement {
  KG = "kg",
  G = "g",
  L = "l",
  UNIT = "unit",
  TSP = "tsp",
  TBSP = "tbsp",
}

export interface ProductBase {
  name: string;
  initial_portion: number;
  unit: Measurement;
  category?: string; // UUID
  ingredient_id: string; // UUID
}

export interface ProductCreate extends ProductBase {}

export interface ProductUpdate {
  name?: string;
  initial_portion?: number;
  unit?: Measurement;
  category?: string;
}

export interface Product extends ProductBase {
  product_id: string;
  created_at: string;
  ingredients?: Ingredient | null;
}