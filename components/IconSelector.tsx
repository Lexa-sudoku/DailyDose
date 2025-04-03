import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { colors } from "@/constants/colors";
import { MedicationIcon } from "./MedicationIcon";
import { translations } from "@/constants/translations";

interface IconSelectorProps {
  selectedIcon: string;
  selectedColor: string;
  onSelectIcon: (iconName: string) => void;
  onSelectColor: (color: string) => void;
}

export const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIcon,
  selectedColor,
  onSelectIcon,
  onSelectColor,
}) => {
  const icons = [
    "Pill",
    "Stethoscope",
    "Heart",
    "Activity",
    "Droplet",
    "Thermometer",
    "Syringe",
    "Bandage",
    "Brain",
    "Eye",
    "Ear",
    "Bone",
  ];

  const iconColors = [
    { name: "Зеленый", value: colors.iconGreen },
    { name: "Синий", value: colors.iconBlue },
    { name: "Красный", value: colors.iconRed },
    // { name: 'Желтый', value: colors.iconYellow },
    { name: "Фиолетовый", value: colors.iconPurple },
    { name: "Оранжевый", value: colors.iconOrange },
    { name: "Розовый", value: colors.iconPink },
    { name: "Бирюзовый", value: colors.iconTeal },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{translations.selectIcon}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.iconsContainer}>
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
                size={24}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Text style={[styles.sectionTitle, styles.colorTitle]}>
        {translations.iconColor}
      </Text>
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 12,
  },
  colorTitle: {
    marginTop: 16,
  },
  iconsContainer: {
    flexDirection: "row",
    flexWrap: "nowrap",
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
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
    // marginRight: 12,
    marginBottom: 12,
    borderWidth: 0,
  },
  selectedColorButton: {
    width: 26,
    height: 26,
  },
});
