import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "@/constants/colors";
import { MedicationIcon } from "./MedicationIcon";
import { translations } from "@/constants/translations";

interface IconSelectorProps {
  selectedIcon: string;
  selectedColor: string;
  onSelectIcon: (iconName: string) => void;
  onSelectColor: (color: string) => void;
  variant: string;
}

export const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIcon,
  selectedColor,
  onSelectIcon,
  onSelectColor,
  variant,
}) => {
  const icons = [
    "Pill",
    "Heart",
    "Activity",
    "Droplet",
    "Syringe",
    "Eye",
    // "Stethoscope",
    // "Thermometer",
    // "Bandage",
    // "Brain",
    // "Ear",
    // "Bone",
  ];

  const iconColors = [
    { name: "Зеленый", value: colors.iconGreen },
    { name: "Синий", value: colors.iconBlue },
    { name: "Красный", value: colors.iconRed },
    { name: "Фиолетовый", value: colors.iconPurple },
    { name: "Оранжевый", value: colors.iconOrange },
    { name: "Розовый", value: colors.iconPink },
    { name: "Бирюзовый", value: colors.iconTeal },
  ];

  return (
    <View style={styles.container}>
      {variant === "edit" && (
        <Text style={styles.sectionTitle}>{translations.selectIcon}</Text>
      )}
      <View
        style={[
          styles.iconsContainer,
          variant === "edit" && { marginVertical: 16 },
        ]}
      >
        {icons.map((iconName) => (
          <TouchableOpacity
            key={iconName}
            style={[
              styles.iconButton,
              selectedIcon === iconName && {
                backgroundColor: selectedColor,
                borderColor: selectedColor,
              },
            ]}
            onPress={() => onSelectIcon(iconName)}
          >
            <MedicationIcon
              iconName={iconName}
              color={selectedIcon === iconName ? colors.white : selectedColor}
              size={25}
            />
          </TouchableOpacity>
        ))}
      </View>

      {variant === "add" && (
        <Text style={styles.colorTitle}>{translations.andColor}</Text>
      )}
      {variant === "edit" && (
        <Text style={styles.sectionTitle}>{translations.iconColor}</Text>
      )}
      <View style={styles.colorsContainer}>
        {iconColors?.map((color) => (
          <TouchableOpacity
            key={color?.value}
            style={[
              styles.colorButton,
              { backgroundColor: color?.value },
              selectedColor === color?.value && styles.selectedColorButton,
            ]}
            onPress={() => onSelectColor(color?.value)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  colorTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.text,
    marginTop: 16,
  },
  iconsContainer: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedIconButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  colorsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 0,
  },
  selectedColorButton: {
    width: 26,
    height: 26,
  },
});
