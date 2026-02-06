const unitMapping: Record<string, string> = {
  kg: "kilogram",
  g: "gram",
  l: "liter",
  ml: "milliliter",
  m: "meter",
  cm: "centimeter",
  unit: "unit",
};

export const weightFormat = (unit: string) => ({
  style: "unit",
  unit: unitMapping[unit] || "kilogram",
  unitDisplay: "short",
});
