import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AlertTriangle, Edit } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Medication } from "@/types";
import { MedicationIcon } from "./MedicationIcon";

interface MedicationInventoryCardProps {
  medication: Medication;
  onEdit: () => void;
}

export const MedicationInventoryCard: React.FC<
  MedicationInventoryCardProps
> = ({ medication, onEdit }) => {
  const {
    name,
    dosage,
    remainingQuantity,
    totalQuantity,
    lowStockThreshold,
    iconName,
    iconColor,
  } = medication;

  const isLowStock = remainingQuantity <= lowStockThreshold;
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
          <Text style={styles.dosage}>{dosage}</Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Edit size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

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
            {remainingQuantity} из {totalQuantity} осталось
          </Text>

          {isLowStock && (
            <View style={styles.lowStockWarning}>
              <AlertTriangle size={14} color={colors.error} />
              <Text style={styles.lowStockText}>Низкий запас</Text>
            </View>
          )}
        </View>
      </View>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  dosage: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  editButton: {
    padding: 8,
  },
  inventoryContainer: {
    marginTop: 4,
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
});
