import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { Ref } from "vue";

// Nouveau type pour les données du backend
export interface ProductDaySummary {
  product_name: string;
  day: string; // YYYY-MM-DD
  initial_portion: number;
  entry: number;
  final_portion: number;
  sale: number;
  remaining: number;
}

export type ProductsSummary = Record<string, ProductDaySummary[]>;

interface UseInventoryOptions {
  products: Ref<ProductsSummary>;
  days: Ref<string[]>; // Juste les dates YYYY-MM-DD
}

interface UseInventoryReturn {
  saleInputs: Ref<Record<string, number[]>>;
  openSummaries: Ref<Record<string, boolean>>;
  formatDayLabel: (dateStr: string) => string;
  formatDayFull: (dateStr: string) => string;
  getDayData: (productName: string, date: string) => ProductDaySummary | undefined;
  getMetric: (productName: string, date: string, field: keyof ProductDaySummary) => number;
  toggleSummary: (productName: string) => void;
  updateSale: (productName: string, dayIndex: number, post: Function, toast: any) => Promise<void>;
}

export function useInventoryLogic(options: UseInventoryOptions): UseInventoryReturn {
  const { products, days } = options;
  
  const saleInputs = ref<Record<string, number[]>>({});
  const openSummaries = ref<Record<string, boolean>>({});

  // Init sale inputs from data
  watch(() => [products.value, days.value], () => {
    const inputs: Record<string, number[]> = {};
    
    for (const [productName, summaries] of Object.entries(products.value)) {
      inputs[productName] = days.value.map(day => {
        const data = getDayData(productName, day);
        return data?.sale ?? 0;
      });
    }
    saleInputs.value = inputs;
  }, { immediate: true });

  function formatDayLabel(dateStr: string): string {
    try {
      return format(parseISO(dateStr), "EEE dd", { locale: fr }).toUpperCase();
    } catch {
      return dateStr;
    }
  }

  function formatDayFull(dateStr: string): string {
    try {
      return format(parseISO(dateStr), "EEE, MMM dd", { locale: fr });
    } catch {
      return dateStr;
    }
  }

  // Récupère les données pour un produit et un jour (somme si plusieurs)
  function getDayData(productName: string, date: string): ProductDaySummary | undefined {
    const summaries = products.value[productName] ?? [];
    const dayEntries = summaries.filter(s => s.day === date);
    
    if (dayEntries.length === 0) return undefined;
    if (dayEntries.length === 1) return dayEntries[0];
    
    // Somme si plusieurs entrées pour le même jour
    return {
      product_name: productName,
      day: date,
      initial_portion: dayEntries[0].initial_portion, // Prend le premier
      entry: dayEntries.reduce((sum, s) => sum + s.entry, 0),
      final_portion: dayEntries.reduce((sum, s) => sum + s.final_portion, 0),
      sale: dayEntries.reduce((sum, s) => sum + s.sale, 0),
      remaining: dayEntries.reduce((sum, s) => sum + s.remaining, 0),
    };
  }

  function getMetric(productName: string, date: string, field: keyof ProductDaySummary): number {
    const data = getDayData(productName, date);
    if (!data) return 0;
    const value = data[field];
    return typeof value === 'number' ? value : 0;
  }

  function toggleSummary(productName: string) {
    openSummaries.value[productName] = !openSummaries.value[productName];
  }

  async function updateSale(productName: string, dayIndex: number, post: Function, toast: any) {
    const day = days.value[dayIndex];
    try {
      await post("/products/transaction", {
        product_name: productName,
        sale: saleInputs.value[productName][dayIndex] ?? 0,
        day: day,
      });
      toast.add({ title: "Succès", description: "Vente enregistrée", color: "success" });
    } catch {
      toast.add({ title: "Erreur", description: "Impossible d'enregistrer", color: "error" });
    }
  }

  return {
    saleInputs,
    openSummaries,
    formatDayLabel,
    formatDayFull,
    getDayData,
    getMetric,
    toggleSummary,
    updateSale,
  };
}