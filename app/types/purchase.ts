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

export interface PurchaseDetail extends PurchaseItem {
  category_name: string
  created_by_name: string
  used_quantity: number
  remaining_quantity: number
  is_transformed: boolean
  notes?: string
}