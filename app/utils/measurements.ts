// Enum unifié pour toutes les mesures
export enum Measurement {
  KG = "KG",
  G = "G",
  L = "L",
  UNIT = "UNIT",
  TSP = "TSP",
  TBSP = "TBSP",
}

// Labels pour affichage
export const measurementLabels: Record<Measurement, string> = {
  [Measurement.KG]: "Kilogramme (kg)",
  [Measurement.G]: "Gramme (g)",
  [Measurement.L]: "Litre (L)",
  [Measurement.UNIT]: "Unité",
  [Measurement.TSP]: "Cuillère à café (tsp)",
  [Measurement.TBSP]: "Cuillère à soupe (tbsp)",
};

// Options formatées pour USelect
export const measurementOptions = Object.values(Measurement).map((value) => ({
  label: measurementLabels[value],
  value,
}));

// Helper pour obtenir le label
export function getMeasurementLabel(unit: Measurement): string {
  return measurementLabels[unit] || unit;
}