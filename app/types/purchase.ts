import { Transformation } from "./transformation";

export interface PurchaseItem {
  id: string;
  inventory_id: string;      // Lien vers l'inventaire
  item_name: string;         // Nom de l'inventaire (denormalisé)
  quantity: number;
  unit: string;              // Unité de l'inventaire
  price_per_unit: number;
  total_price: number;
  purchase_date: string;
  category_id: string;       // Catégorie de l'inventaire
  notes: string;
  created_by: string;
  transformations: Transformation[];
}

export interface CreatePurchaseInput {
  inventory_id: string;      // Requis - lien vers l'inventaire
  quantity: number;
  price_per_unit: number;
  purchase_date: string;
  notes: string;
}