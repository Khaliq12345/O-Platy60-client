import { format, parseISO, isBefore, isEqual, parse } from "date-fns";
import { fr } from "date-fns/locale";
import type { Ref } from "vue";
import type {
  Inventory,
  DayData,
  DailyTransactionSummary,
} from "~/types/inventory";

export type InventoryTransactions = Record<string, DailyTransactionSummary[]>;
export type InventorySaleInputs = Record<string, number[]>;

interface SaveInventorySaleArgs {
  post: (url: string, payload: Record<string, unknown>) => Promise<unknown>;
  toast: { add: (payload: Record<string, unknown>) => void };
  inventoryId: string;
  sale: number;
  createdAt: string;
}

// Parse une date YYYY-MM-DD
function parseDate(dateStr: string): Date {
  return parse(dateStr, "yyyy-MM-dd", new Date());
}

// Trouve une transaction pour une date exacte
function findTransactionForDate(
  transactions: DailyTransactionSummary[],
  targetDate: string,
): DailyTransactionSummary | undefined {
  return transactions.find((tx) => tx.summary_date === targetDate);
}

export function formatInventoryDay(dateStr: string, pattern: string): string {
  try {
    return format(parseISO(dateStr), pattern, { locale: fr }).toUpperCase();
  } catch {
    return dateStr;
  }
}

// Récupère les entrées pour un jour
export function getEntryForDay(
  transactions: DailyTransactionSummary[],
  date: string,
): number {
  const tx = findTransactionForDate(transactions, date);
  return tx?.total_quantity ?? 0;
}

// Récupère les ventes pour un jour
export function getSalesForDay(
  transactions: DailyTransactionSummary[],
  date: string,
): number {
  const tx = findTransactionForDate(transactions, date);
  return tx?.total_sales ?? 0;
}

// Initialise les inputs de vente
export function syncSaleInputsForItems(
  items: Inventory[],
  days: DayData[],
  transactions: Record<string, DailyTransactionSummary[]>,
  saleInputs: Ref<Record<string, number[]>>,
): void {
  const newInputs: Record<string, number[]> = {};
  
  items.forEach((item) => {
    const itemTransactions = transactions[item.inventory_id] ?? [];
    
    newInputs[item.inventory_id] = days.map((day) => {
      return getSalesForDay(itemTransactions, day.date);
    });
  });
  
  saleInputs.value = newInputs;
}

// CORRECTION CLÉ : Calcule le stock initial pour un jour donné
// Stock initial = initial_quantity + toutes les entrées des jours précédents - toutes les ventes des jours précédents
// Mais UNIQUEMENT pour les jours de la semaine affichée
export function calculateInitialStock(
  item: Inventory,
  days: DayData[],
  dayIndex: number,
  transactions: DailyTransactionSummary[],
): number {
  const targetDay = days[dayIndex];
  const targetDate = parseDate(targetDay.date);
  
  let stock = item.initial_quantity ?? 0;
  
  // Parcourir TOUS les jours de la semaine avant le jour cible
  for (let i = 0; i < dayIndex; i++) {
    const currentDay = days[i];
    const currentDate = parseDate(currentDay.date);
    
    // Ne prendre en compte que les jours AVANT le jour cible
    if (isBefore(currentDate, targetDate) || isEqual(currentDate, targetDate)) {
      const sales = getSalesForDay(transactions, currentDay.date);
      const entries = getEntryForDay(transactions, currentDay.date);
      
      stock = stock - sales + entries;
      if (stock < 0) stock = 0;
    }
  }
  
  return stock;
}

// Stock final = stock initial du jour + entrées du jour
export function calculateFinalStock(
  initialStock: number,
  entries: number,
): number {
  return Math.max(0, initialStock + entries);
}

// Restant = stock final - ventes du jour (input utilisateur)
export function calculateRemaining(
  finalStock: number,
  sales: number,
): number {
  return Math.max(0, finalStock - sales);
}

export function toggleSummaryState(
  openSummaries: Ref<Record<string, boolean>>,
  inventoryId: string,
): void {
  openSummaries.value[inventoryId] = !openSummaries.value[inventoryId];
}

export async function saveInventorySale({
  post,
  toast,
  inventoryId,
  sale,
  createdAt,
}: SaveInventorySaleArgs): Promise<void> {
  try {
    await post("/inventories/transactions", {
      inventory_id: inventoryId,
      sale,
      created_at: createdAt,
    });

    toast.add({
      title: "Succès",
      description: "Vente enregistrée",
      color: "success",
    });
  } catch {
    toast.add({
      title: "Erreur",
      description: "Impossible d'enregistrer la vente",
      color: "error",
    });
  }
}