import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { Ref } from "vue";
import type { Inventory, DayData, DailyTransactionSummary } from "~/types/inventory";

export type InventoryTransactions = Record<string, DailyTransactionSummary[]>;

interface UseInventoryOptions {
  items: Ref<Inventory[]>;
  days: Ref<DayData[]>;
  transactions: Ref<InventoryTransactions>;
}

interface UseInventoryReturn {
  saleInputs: Ref<Record<string, number[]>>;
  openSummaries: Ref<Record<string, boolean>>;
  formatDayLabel: (dateStr: string, pattern?: string) => string;
  formatDayFull: (dateStr: string) => string;
  findTx: (inventoryId: string, date: string) => DailyTransactionSummary | undefined;
  getMetric: (inventoryId: string, date: string, type: 'initial' | 'entries' | 'final' | 'remaining') => number;
  toggleSummary: (inventoryId: string) => void;
  updateSale: (item: Inventory, day: DayData, index: number, post: Function, toast: any) => Promise<void>;
}

export function useInventoryLogic(options: UseInventoryOptions): UseInventoryReturn {
  const { items, days, transactions } = options;
  
  const saleInputs = ref<Record<string, number[]>>({});
  const openSummaries = ref<Record<string, boolean>>({});

  // Init sale inputs from transactions
  watch(() => [items.value, transactions.value], () => {
    const inputs: Record<string, number[]> = {};
    for (const item of items.value) {
      inputs[item.inventory_id] = days.value.map(day => {
        const tx = findTx(item.inventory_id, day.date);
        return tx?.total_sales ?? 0;
      });
    }
    saleInputs.value = inputs;
  }, { immediate: true });

  function formatDayLabel(dateStr: string, pattern: string = "EEE dd"): string {
    try {
      return format(parseISO(dateStr), pattern, { locale: fr }).toUpperCase();
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

  function findTx(inventoryId: string, date: string): DailyTransactionSummary | undefined {
    return transactions.value[inventoryId]?.find(tx => tx.summary_date === date);
  }

  function getMetric(inventoryId: string, date: string, type: 'initial' | 'entries' | 'final' | 'remaining'): number {
    const item = items.value.find(i => i.inventory_id === inventoryId);
    const tx = findTx(inventoryId, date);
    
    if (!item) return 0;
    if (!tx) {
      if (type === 'initial') return item.initial_quantity ?? 0;
      return 0;
    }
    
    const sales = tx.total_sales ?? 0;
    const quantity = tx.total_quantity ?? 0;
    
    switch (type) {
      case 'initial':
        return Math.max(0, quantity > item.initial_quantity ? item.initial_quantity : quantity);
      case 'entries':
        return Math.max(0, quantity - item.initial_quantity);
      case 'final':
        return quantity;
      case 'remaining':
        return Math.max(0, quantity - sales);
      default:
        return 0;
    }
  }

  function toggleSummary(inventoryId: string) {
    openSummaries.value[inventoryId] = !openSummaries.value[inventoryId];
  }

  async function updateSale(item: Inventory, day: DayData, index: number, post: Function, toast: any) {
    try {
      await post("/inventories/transactions", {
        inventory_id: item.inventory_id,
        sale: saleInputs.value[item.inventory_id][index] ?? 0,
        created_at: day.date,
      });
      toast.add({ title: "Succès", description: "Vente enregistrée", color: "success" });
      window.location.reload();
    } catch {
      toast.add({ title: "Erreur", description: "Impossible d'enregistrer", color: "error" });
    }
  }

  return {
    saleInputs,
    openSummaries,
    formatDayLabel,
    formatDayFull,
    findTx,
    getMetric,
    toggleSummary,
    updateSale,
  };
}