// types/product.ts
// Résumé quotidien
export interface DailyTransactionSummary {
  created_at: string;    // ISO 8601 timestamp
  total_sales: number;
  total_quantity: number;
  product_id: string;  // UUID
  summary_date: string;  // ISO 8601 date (YYYY-MM-DD)
}

// Transaction
export interface ProductTransactionBase {
  product_id: string;
  sale: number;
}

export interface ProductTransactionCreate extends ProductTransactionBase {
  created_at?: string | null;
}

export interface ProductTransaction extends ProductTransactionBase {
  id: number;
  entry: number;
  created_at: string;
}

// Product
export interface ProductBase {
  name: string;
  initial_quantity: number;
  unit: string;
  category?: string;
}

export interface ProductCreate extends ProductBase {}

export interface ProductUpdate {
  name?: string;
  initial_quantity?: number;
  unit?: string;
  category?: string;
}

export interface Product extends ProductBase {
  product_id: string;
  created_at: string;
  daily_transaction_summary: DailyTransactionSummary[];
}

// Réponse du serveur
export interface ProductsResponse {
  products: Product[];
  count: number;
}

// Résumé hebdomadaire
export interface WeeklyProductSummary {
  id: number;
  start_date: string;
  end_date: string;
  total_sale: number;
  remaining_quantity: number;
  manual_inventory: number;
  difference: number;
  product_id: string;
}

// Données pour une journée
export interface DayData {
  date: string;
  entry: number;
  sale: number;
  transactionId?: number;
}

// Résumé de produit hebdomadaire
export interface ProductWeeklySummary {
  final_quantity: number;
  total_sales: number;
  calculated_diff: number;
}