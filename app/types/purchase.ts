export interface PurchaseItem {
  id: string;
  item_name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total_price: number;
  purchase_date: string; // format: YYYY-MM-DD
  category_id: string;
  notes: string;
  created_by: string;
}
export interface CreatePurchaseInput {
  item_name: string
  quantity: number
  unit: string
  price_per_unit: number
  purchase_date: string
  category_id: string
  notes: string
}