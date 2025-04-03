import { colors } from "@/constants/colors";

export const medicationIcons = [
  "Pill",
  "Tablets",
  "Capsule",
  "Syringe",
  "Thermometer",
  "Stethoscope",
  "Heart",
  "Activity",
  "Droplet",
  "Vial",
  "Bandage",
  "FirstAid",
  "Lungs",
  "Brain",
  "Eye",
  "Ear",
  "Tooth",
  "Bone",
  "Stomach",
  "Kidney",
];

export const iconColors = [
  { name: "Зеленый", value: colors.iconGreen },
  { name: "Синий", value: colors.iconBlue },
  { name: "Красный", value: colors.iconRed },
  { name: "Фиолетовый", value: colors.iconPurple },
  { name: "Оранжевый", value: colors.iconOrange },
  { name: "Розовый", value: colors.iconPink },
  { name: "Бирюзовый", value: colors.iconTeal },
];

export const getDefaultIconName = () => "Pill";
export const getDefaultIconColor = () => colors.iconGreen;
