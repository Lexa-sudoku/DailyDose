import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AlertTriangle, Edit, Plus } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Medication } from "@/types";
import { MedicationIcon } from "./MedicationIcon";
import {
  MedicationForms,
  pluralize,
  UnitsByForm,
} from "@/constants/medication";
import { translations } from "@/constants/translations";

interface MedicationInventoryCardProps {
  medication: Medication;
  onEdit: () => void;
  onRefill: () => void;
}

export const MedicationInventoryCard: React.FC<
  MedicationInventoryCardProps
> = ({ medication, onEdit, onRefill }) => {
  const {
    name,
    dosagePerUnit,
    form,
    remainingQuantity,
    totalQuantity,
    lowStockThreshold,
    iconName,
    iconColor,
    trackStock,
  } = medication;

  const isLowStock = trackStock && remainingQuantity <= lowStockThreshold;
  const percentRemaining = (remainingQuantity / totalQuantity) * 100;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MedicationIcon
            iconName={iconName || "Pill"}
            color={iconColor || colors.primary}
            size={24}
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.medicationName}>{name}</Text>
          <Text style={styles.form}>
            {MedicationForms[form]}
            {dosagePerUnit ? `, ${dosagePerUnit}` : ""}
          </Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Edit size={18} color={colors.primary} />
        </TouchableOpacity>
        {trackStock && (
          <TouchableOpacity style={styles.editButton} onPress={onRefill}>
            <Plus size={18} color={colors.primary} />
            <Text style={styles.addButtonText}>
              {" "}
              {translations.addQuantity}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {trackStock && (
        <View style={styles.inventoryContainer}>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${percentRemaining}%`,
                  backgroundColor: isLowStock ? colors.error : colors.primary,
                },
              ]}
            />
          </View>

          <View style={styles.inventoryInfo}>
            <Text style={styles.inventoryText}>
              {translations.remainingQuantity} {remainingQuantity}{" "}
              {translations.outOf} {totalQuantity}{" "}
              {pluralize(UnitsByForm[form][0], totalQuantity)}
            </Text>

            {isLowStock && (
              <View style={styles.lowStockWarning}>
                <AlertTriangle size={14} color={colors.error} />
                <Text style={styles.lowStockText}>
                  {translations.lowStockThreshold}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  form: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  editButton: {
    padding: 8,
    flexDirection: "row",
  },
  inventoryContainer: {
    marginTop: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  inventoryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inventoryText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  lowStockWarning: {
    flexDirection: "row",
    alignItems: "center",
  },
  lowStockText: {
    fontSize: 14,
    color: colors.error,
    marginLeft: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
});
