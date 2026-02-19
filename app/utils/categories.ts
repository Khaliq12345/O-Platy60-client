import type { Category } from "~/types/category";

export async function loadCategories(toast?: any): Promise<Category[]> {
  const { get } = useApi();
  
  try {
    const response = await get<{ categories: Category[]; count: number }>(
      "/categories"
    );
    return response?.categories ?? [];
  } catch (err) {
    toast?.add({
      title: "Erreur",
      description: "Impossible de charger les catégories.",
      color: "error",
    });
    return [];
  }
}