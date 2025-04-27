import { MedicationForm, UnitsByForm } from "@/constants/medication";

function parseDosageString(
  dosage: string
): { value: number; unit: string } | null {
  const match = dosage.trim().match(/^([\d.]+)\s*([^\d\s]+)$/);
  if (!match) return null;
  return { value: parseFloat(match[1]), unit: match[2] };
}

export const convertUnit = (
  form: MedicationForm,
  value: number,
  fromUnit: string,
  medDosagePerUnit?: string
): number => {
  const units = UnitsByForm[form];
  const defaultUnit = units[0][0];

  // Если изначально единицы совпадают — возвращаем значение
  if (fromUnit === defaultUnit) return value;

  if ((form === "tablet" || form === "capsule" ) && medDosagePerUnit) {
    const parsed = parseDosageString(medDosagePerUnit);
    if (parsed) {
      const { value: medUnitValue, unit: medUnit } = parsed;

      if (fromUnit === medUnit) return value / medUnitValue; // мг
      else return (value * 1000) / medUnitValue; // г
    }
  }

  // Таблица конверсии: [fromUnit][toUnit] = множитель
  const conversionTable: Record<string, Record<string, number>> = {
    мг: { г: 0.001 },
    г: { мг: 1000 },
    мл: { "чайная ложка": 1 / 5, "столовая ложка": 1 / 15 },
    "чайная ложка": { мл: 5 },
    "столовая ложка": { мл: 15 },
    капля: { мл: 0.05 },
    впрыск: { мл: 0.1 },
  };

  const multiplier =
    conversionTable[fromUnit]?.[defaultUnit] ??
    1 / (conversionTable[defaultUnit]?.[fromUnit] ?? NaN);

  if (isNaN(multiplier)) {
    console.warn(`${fromUnit} cannot be converted to ${defaultUnit}`);
    return 0;
  }

  return value * multiplier;
};
