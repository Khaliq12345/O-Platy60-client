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
}

// Réponse du serveur
export interface InventoriesResponse {
  inventories: Inventory[];
  count: number;
}