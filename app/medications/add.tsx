import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pill, AlertCircle } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useMedicationStore } from "@/store/medication-store";
import { translations } from "@/constants/translations";
import { IconSelector } from "@/components/IconSelector";

export default function AddMedicationScreen() {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [totalQuantity, setTotalQuantity] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedIcon, setSelectedIcon] = useState("Pill");
  const [selectedIconColor, setSelectedIconColor] = useState(colors.iconGreen);

  const { addMedication } = useMedicationStore();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = translations.required;
    }

    if (!dosage.trim()) {
      newErrors.dosage = translations.required;
    }

    if (!totalQuantity.trim()) {
      newErrors.totalQuantity = translations.required;
    } else if (isNaN(Number(totalQuantity)) || Number(totalQuantity) <= 0) {
      newErrors.totalQuantity = translations.invalidQuantity;
    }

    if (!lowStockThreshold.trim()) {
      newErrors.lowStockThreshold = translations.required;
    } else if (
      isNaN(Number(lowStockThreshold)) ||
      Number(lowStockThreshold) < 0
    ) {
      newErrors.lowStockThreshold = translations.invalidQuantity;
    } else if (Number(lowStockThreshold) >= Number(totalQuantity)) {
      newErrors.lowStockThreshold = translations.thresholdTooHigh;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    addMedication({
      name,
      dosage,
      instructions,
      totalQuantity: Number(totalQuantity),
      remainingQuantity: Number(totalQuantity),
      lowStockThreshold: Number(lowStockThreshold),
      iconName: selectedIcon,
      iconColor: selectedIconColor,
    });

    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <Stack.Screen
        options={{
          title: translations.addMedication,
          headerBackTitle: translations.back,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>
            {translations.medicationDetails}
          </Text>

          <IconSelector
            selectedIcon={selectedIcon}
            selectedColor={selectedIconColor}
            onSelectIcon={setSelectedIcon}
            onSelectColor={setSelectedIconColor}
          />

          <Input
            label={translations.medicationName}
            value={name}
            onChangeText={setName}
            placeholder="Парацетамол"
            error={errors.name}
            leftIcon={<Pill size={20} color={colors.darkGray} />}
          />

          <Input
            label={translations.dosage}
            value={dosage}
            onChangeText={setDosage}
            placeholder="500 мг, 1 таблетка"
            error={errors.dosage}
          />

          <Input
            label={translations.instructionsOptional}
            value={instructions}
            onChangeText={setInstructions}
            placeholder="Принимать с водой"
            multiline
            numberOfLines={3}
          />

          <View style={styles.rowInputs}>
            <Input
              label={translations.totalQuantity}
              value={totalQuantity}
              onChangeText={setTotalQuantity}
              placeholder="30"
              keyboardType="numeric"
              error={errors.totalQuantity}
              style={{ flex: 1, marginRight: 8 }}
            />

            <Input
              label={translations.lowStockThreshold}
              value={lowStockThreshold}
              onChangeText={setLowStockThreshold}
              placeholder="5"
              keyboardType="numeric"
              error={errors.lowStockThreshold}
              style={{ flex: 1, marginLeft: 8 }}
              leftIcon={<AlertCircle size={20} color={colors.darkGray} />}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={translations.saveMedication}
            onPress={handleSave}
            style={styles.saveButton}
          />

          <Button
            title={translations.cancel}
            onPress={() => router.back()}
            variant="outline"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  formSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  rowInputs: {
    flexDirection: "row",
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  saveButton: {
    marginBottom: 12,
  },
});
