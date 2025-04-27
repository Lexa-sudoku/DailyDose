import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Check, X, Clock, AlertCircle } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { formatTime, getMealRelationText } from "@/utils/date-utils";
import { DailyMedicationWithStatus } from "@/types";
import { translations } from "@/constants/translations";
import { MedicationIcon } from "./MedicationIcon";
import { Button } from "./Button";
import { LinearGradient } from "expo-linear-gradient";
import { getUnitDisplayFromRaw } from "@/constants/medication";

interface MedicationCardProps {
  selectedDate: Date;
  medication: DailyMedicationWithStatus;
  onMarkTaken: (time: string, dosageByTime: string, unit: string) => void;
  onMarkMissed: (time: string, dosageByTime: string, unit: string) => void;
  status: string;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({
  selectedDate,
  medication,
  onMarkTaken,
  onMarkMissed,
  status,
}) => {
  const {
    name,
    time,
    mealRelation,
    iconName,
    iconColor,
    instructions,
    dosageByTime,
    unit,
  } = medication;
  const [modalVisible, setModalVisible] = useState(false);

  // Проверяем, наступило ли время приема
  const isTimeToTake = () => {
    if (status !== "pending") return false;

    const now = new Date();
    const [hours, minutes] = time.split(":").map(Number);
    const scheduledTime = selectedDate;
    scheduledTime.setHours(hours, minutes, 0, 0);

    return now >= scheduledTime;
  };

  const getStatusColor = () => {
    switch (status) {
      case "taken":
        return colors.success;
      case "missed":
        return colors.error;
      default:
        return colors.waiting;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "taken":
        return <Check size={24} color={colors.white} />;
      case "missed":
        return <X size={24} color={colors.white} />;
      default:
        return <Clock size={24} color={colors.white} />;
    }
  };

  const handleCardPress = () => {
    setModalVisible(true);
  };

  const handleMarkTaken = () => {
    onMarkTaken(time, dosageByTime, unit);
    setModalVisible(false);
  };

  const handleMarkMissed = () => {
    onMarkMissed(time, dosageByTime, unit);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={handleCardPress}>
        <View style={styles.gradientContainer}>
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={[colors.card, getStatusColor()]}
            style={styles.linearGradient}
          />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.medicationInfo}>
            <View style={styles.nameContainer}>
              <MedicationIcon
                iconName={iconName}
                color={iconColor || colors.primary}
                size={35}
              />
              <View>
                <Text style={styles.medicationName}>{name}</Text>
                <Text style={styles.dosage}>
                  {getMealRelationText(mealRelation) +
                    ", " +
                    dosageByTime +
                    " " +
                    getUnitDisplayFromRaw(unit, parseInt(dosageByTime))}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MedicationIcon
                iconName={iconName || "Pill"}
                color={iconColor || colors.primary}
                size={28}
              />
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>{name}</Text>
                <Text style={styles.modalSubtitle}>
                  {dosageByTime +
                    " " +
                    getUnitDisplayFromRaw(unit, parseInt(dosageByTime))}
                </Text>
              </View>
            </View>

            <View>
              <View style={styles.modalContainer}>
                <View style={styles.modalBody}>
                  <View style={styles.infoRow}>
                    <Clock size={20} color={colors.textSecondary} />
                    <Text style={styles.infoText}>{formatTime(time)}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <AlertCircle size={20} color={colors.textSecondary} />
                    <Text style={styles.infoText}>
                      {getMealRelationText(mealRelation)}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: getStatusColor() },
                  ]}
                >
                  {getStatusIcon()}
                </View>
              </View>
              {instructions && (
                <View style={styles.instructionsContainer}>
                  <Text style={styles.instructionsTitle}>
                    {translations.instructions}
                  </Text>
                  <Text style={styles.instructionsText}>{instructions}</Text>
                </View>
              )}
            </View>

            <View style={styles.modalFooter}>
              {status === "pending" && (
                <View style={styles.modalActions}>
                  <Button
                    title={translations.take}
                    onPress={handleMarkTaken}
                    icon={<Check size={18} color={colors.white} />}
                    style={styles.modalActionButton}
                    disabled={!isTimeToTake()}
                  />

                  <Button
                    title={translations.skip}
                    onPress={handleMarkMissed}
                    variant="secondary"
                    icon={<X size={18} color={colors.white} />}
                    style={styles.modalActionButton}
                    disabled={!isTimeToTake()}
                  />
                </View>
              )}

              <Button
                title={translations.close}
                onPress={() => setModalVisible(false)}
                variant="outline"
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginVertical: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "flex-end",
  },
  linearGradient: {
    width: "33%",
    height: "100%",
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    opacity: 0.5,
  },
  contentContainer: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeContainer: {
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },
  time: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  mealRelation: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  medicationInfo: {
    flex: 1,
    justifyContent: "center",
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginLeft: 16,
  },
  dosage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 16,
  },
  statusIndicator: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 12,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  takenButton: {
    backgroundColor: colors.success,
  },
  missedButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: "100%",
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modalContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  modalBody: {
    width: "70%",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  instructionsContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  modalFooter: {
    marginTop: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalActionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});
