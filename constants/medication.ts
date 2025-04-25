export const MedicationForms = {
  tablet: "Таблетки",
  capsule: "Капсулы",
  drops: "Капли",
  liquid: "Жидкость",
  ointment: "Мазь",
  spray: "Спрей",
  powder: "Порошок",
} as const;

export type MedicationForm = keyof typeof MedicationForms;

export const UnitsByForm: Record<MedicationForm, [string, string, string][]> = {
  tablet: [
    ["таблетка", "таблетки", "таблеток"],
    ["мг", "мг", "мг"],
    ["г", "г", "г"],
  ],
  capsule: [
    ["капсула", "капсулы", "капсул"],
    ["мг", "мг", "мг"],
    ["г", "г", "г"],
  ],
  drops: [
    ["мл", "мл", "мл"],
    ["капля", "капли", "капель"],
  ],
  liquid: [
    ["мл", "мл", "мл"],
    ["чайная ложка", "чайные ложки", "чайных ложек"],
    ["столовая ложка", "столовые ложки", "столовых ложек"],
  ],
  ointment: [
    ["мг", "мг", "мг"],
    ["г", "г", "г"],
  ],
  spray: [
    ["впрыск", "впрыска", "впрысков"],
    ["мл", "мл", "мл"],
  ],
  powder: [
    ["мг", "мг", "мг"],
    ["г", "г", "г"],
  ],
};

export function getPluralForm(n: number): 0 | 1 | 2 {
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod10 === 1 && mod100 !== 11) return 0; // одна
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return 1; // несколько
  return 2; // много
}

export function pluralize(
  unitForms: [string, string, string],
  count: number
): string {
  return unitForms[getPluralForm(count)];
}

export function getUnitDisplayFromRaw(unit: string, dosage: number): string {
  for (const form in UnitsByForm) {
    const units = UnitsByForm[form as keyof typeof UnitsByForm];
    for (const triplet of units) {
      if (triplet.includes(unit)) {
        return pluralize(triplet, dosage);
      }
    }
  }
  return unit;
}
