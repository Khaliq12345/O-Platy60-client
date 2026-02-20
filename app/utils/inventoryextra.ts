import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { Ref } from "vue";
import type {
  Inventory,
  DayData,
  DailyTransactionSummary,
} from "~/types/inventory";

export type InventoryTransactions = Record<string, DailyTransactionSummary[]>;
export type InventorySaleInputs = Record<string, number[]>;

interface InventoryMetricsContext {
  items: Inventory[];
  days: DayData[];
  transactions: InventoryTransactions;
  saleInputs: InventorySaleInputs;
}

interface SaveInventorySaleArgs {
  post: (url: string, payload: Record<string, unknown>) => Promise<unknown>;
  toast: { add: (payload: Record<string, unknown>) => void };
  inventoryId: string;
  sale: number;
  createdAt: string;
}

function findTransaction(
  transactions: InventoryTransactions,
  inventoryId: string,
  date: string,
): DailyTransactionSummary | undefined {
  return transactions[inventoryId]?.find((tx) => tx.summary_date === date);
}

function getItemInitialQuantity(items: Inventory[], inventoryId: string): number {
  return items.find((item) => item.inventory_id === inventoryId)?.initial_quantity ?? 0;
}

function getSaleValueForDay(
  inventoryId: string,
  dayIndex: number,
  date: string,
  saleInputs: InventorySaleInputs,
  transactions: InventoryTransactions,
): number {
  const inputValue = saleInputs[inventoryId]?.[dayIndex];
  if (typeof inputValue === "number") {
    return inputValue;
  }

  return findTransaction(transactions, inventoryId, date)?.total_sales ?? 0;
}

export function formatInventoryDay(dateStr: string, pattern: string): string {
  return format(parseISO(dateStr), pattern, { locale: fr }).toUpperCase();
}

export function getEntryQuantity(
  transactions: InventoryTransactions,
  inventoryId: string,
  date: string,
): number {
  return findTransaction(transactions, inventoryId, date)?.total_quantity ?? 0;
}

export function syncSaleInputsForItems(
  items: Inventory[],
  days: DayData[],
  transactions: InventoryTransactions,
  saleInputs: Ref<InventorySaleInputs>,
): void {
  items.forEach((item) => {
    if (!saleInputs.value[item.inventory_id]) {
      saleInputs.value[item.inventory_id] = days.map((day) => {
        return findTransaction(transactions, item.inventory_id, day.date)?.total_sales ?? 0;
      });
    }
  });
}

export function getInitialQuantityForDay(
  inventoryId: string,
  dayIndex: number,
  context: InventoryMetricsContext,
): number {
  let runningRemaining = getItemInitialQuantity(context.items, inventoryId);
  if (dayIndex <= 0) {
    return runningRemaining;
  }

  for (let i = 0; i < dayIndex; i += 1) {
    const day = context.days[i];
    const entries = getEntryQuantity(context.transactions, inventoryId, day.date);
    const sales = getSaleValueForDay(
      inventoryId,
      i,
      day.date,
      context.saleInputs,
      context.transactions,
    );
    runningRemaining = Math.max(0, runningRemaining + entries - sales);
  }

  return runningRemaining;
}

export function calculateFinalStockForDay(
  inventoryId: string,
  date: string,
  dayIndex: number,
  context: InventoryMetricsContext,
): number {
  const initial = getInitialQuantityForDay(inventoryId, dayIndex, context);
  const entries = getEntryQuantity(context.transactions, inventoryId, date);
  return Math.max(0, initial + entries);
}

export function calculateRemainingForDay(
  inventoryId: string,
  date: string,
  dayIndex: number,
  context: InventoryMetricsContext,
): number {
  const finalStock = calculateFinalStockForDay(inventoryId, date, dayIndex, context);
  const sales = getSaleValueForDay(
    inventoryId,
    dayIndex,
    date,
    context.saleInputs,
    context.transactions,
  );
  return Math.max(0, finalStock - sales);
}

export function getCurrentStockForToday(
  item: Inventory,
  transactions: InventoryTransactions,
  today = new Date().toISOString().split("T")[0],
): number {
  const tx = findTransaction(transactions, item.inventory_id, today);
  return tx?.total_quantity ?? item.initial_quantity ?? 0;
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
