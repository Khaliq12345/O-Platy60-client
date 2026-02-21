import type { Inventory } from "~/types/inventory";

export async function loadInventories(toast?: any): Promise<Inventory[]> {
  const { get } = useApi();
  
  try {
    const response = await get<{ inventories: Inventory[]; count: number }>(
      "/inventories"
    );
    return response?.inventories ?? [];
  } catch (err) {
    toast?.add({
      title: "Erreur",
      description: "Impossible de charger les produits.",
      color: "error",
    });
    return [];
  }
}