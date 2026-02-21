import type { Ingredient } from "@/types/ingredient";
export async function loadIngredients(params?: Record<string, any>) {
  const { get } = useApi();
  return await get<{
    ingredients: Ingredient[];
    count: number;
  }>("/ingredients", params);
}
