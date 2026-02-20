import type { Category } from "~/types/category";

export async function loadCategories(): Promise<Category[]> {
  const { get } = useApi();
  const response = await get<{ categories: Category[]; count: number }>(
    "/categories",
  );
  return response?.categories ?? [];
}
