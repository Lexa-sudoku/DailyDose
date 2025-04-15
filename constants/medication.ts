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
  
  export const UnitsByForm: Record<MedicationForm, string[]> = {
    tablet: ["таблетка", "мг", "г"],
    capsule: ["капсула", "мг", "г"],
    drops: ["мл", "капля"],
    liquid: ["мл", "чайная ложка", "столовая ложка"],
    ointment: ["мг", "г"],
    spray: ["впрыск", "мл"],
    powder: ["мг", "г"],
  };
  