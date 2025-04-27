import React, { useState } from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import { useMedicationStore } from "@/store/medication-store";
import { colors } from "@/constants/colors";
import { Button } from "@/components/Button";
import { translations } from "@/constants/translations";
import { Input } from "./Input";

interface Props {
  visible: boolean;
  onClose: () => void;
  medication: any;
}

export const EditMedicationModal: React.FC<Props> = ({
  visible,
  onClose,
  medication,
}) => {
  const [quantityToAdd, setQuantityToAdd] = useState("");
  const { updateMedication } = useMedicationStore();

  const handleSave = () => {
    const additional = parseFloat(quantityToAdd);
    if (!isNaN(additional)) {
      updateMedication(medication.id, {
        remainingQuantity: medication.remainingQuantity + additional,
        totalQuantity: medication.remainingQuantity + additional,
      });
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{translations.addStock}</Text>
          <Text style={styles.label}>{translations.enterNumber}</Text>
          <Input
            keyboardType="numeric"
            value={quantityToAdd}
            onChangeText={setQuantityToAdd}
            placeholder="10"
            rightIcon={
              <Text style={{ color: colors.darkGray }}>{medication.unit}</Text>
            }
            accessoryViewID="stockAdd"
          />
          <View style={styles.buttons}>
            <Button
              title={translations.cancel}
              onPress={onClose}
              variant="text"
            />
            <Button title={translations.addQuantity} onPress={handleSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.background,
    padding: 24,
    borderRadius: 16,
    width: "90%",
    height: 220,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
