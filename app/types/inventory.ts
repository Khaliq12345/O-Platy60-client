// Transaction
export interface InventoryTransactionBase {
  inventory_id: string;
  sale: number;
}

export interface InventoryTransactionCreate extends InventoryTransactionBase {
  created_at?: string | null;
}

export interface InventoryTransaction extends InventoryTransactionBase {
  id: number;
  entry: number;
  created_at: string;
}

// Inventory
//
export interface InventoryBase {
  name: string;
  initial_quantity: number;
  unit: string;
  category?: string;
}

export interface InventoryCreate extends InventoryBase {}

export interface InventoryUpdate {
  name?: string;
  initial_quantity?: number;
  unit?: string;
  category?: string;
}

export interface Inventory extends InventoryBase {
  inventory_id: string;
  created_at: string;
  inventory_transaction: InventoryTransaction[];
}

// Réponse du serveur
export interface InventoriesResponse {
  inventories: Inventory[];
  count: number;
}
// Résumé hebdomadaire
export interface WeeklyInventorySummary {
  id: number;
  start_date: string;
  end_date: string;
  total_sale: number;
  remaining_quantity: number;
  manual_inventory: number;
  difference: number;
  inventory_id: string;
}

// Données pour une journée
export interface DayData {
  date: string;
  entry: number;
  sale: number;
  transactionId?: number;
}
