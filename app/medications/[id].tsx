import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertCircle, Trash2 } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useMedicationStore } from "@/store/medication-store";
import { translations } from "@/constants/translations";
import { IconSelector } from "@/components/IconSelector";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  MedicationForm,
  MedicationForms,
  pluralize,
  UnitsByForm,
} from "@/constants/medication";
import { Picker } from "@react-native-picker/picker";

export default function EditMedicationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { getMedicationById, updateMedication, deleteMedication } =
    useMedicationStore();

  const medication = getMedicationById(id);

  const [name, setName] = useState("");
  const [form, setForm] = useState<MedicationForm>("tablet");
  const [trackStock, setTrackStock] = useState(false);
  const [dosagePerUnit, setDosagePerUnit] = useState("");
  const [unit, setUnit] = useState(UnitsByForm[form][0][0]);
  const [instructions, setInstructions] = useState("");
  const [totalQuantity, setTotalQuantity] = useState("");
  const [remainingQuantity, setRemainingQuantity] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedIcon, setSelectedIcon] = useState("Pill");
  const [selectedIconColor, setSelectedIconColor] = useState(colors.iconGreen);
  const [isInitialized, setIsInitialized] = useState(false);

  // Инициализируем данные только один раз при загрузке компонента
  useEffect(() => {
    if (!isInitialized && medication) {
      setName(medication.name);
      setForm(medication.form);
      setTrackStock(medication.trackStock);
      setDosagePerUnit(medication.dosagePerUnit || "");
      setUnit(medication.unit);
      setInstructions(medication.instructions);
      setTotalQuantity(medication.totalQuantity.toString());
      setRemainingQuantity(medication.remainingQuantity.toString());
      setLowStockThreshold(medication.lowStockThreshold.toString());
      setSelectedIcon(medication.iconName || "Pill");
      setSelectedIconColor(medication.iconColor || colors.iconGreen);

      setIsInitialized(true);
    }
    setUnit(UnitsByForm[form][0][0]);
  }, [medication, isInitialized, form]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = translations.required;
    }

    if (trackStock) {
      if (!totalQuantity.trim()) {
        newErrors.totalQuantity = translations.required;
      } else if (isNaN(Number(totalQuantity)) || Number(totalQuantity) <= 0) {
        newErrors.totalQuantity = translations.invalidQuantity;
      }

      if (!remainingQuantity.trim()) {
        newErrors.remainingQuantity = translations.required;
      } else if (
        isNaN(Number(remainingQuantity)) ||
        Number(remainingQuantity) < 0
      ) {
        newErrors.remainingQuantity = translations.invalidQuantity;
      } else if (Number(remainingQuantity) > Number(totalQuantity)) {
        newErrors.remainingQuantity = translations.remainingTooHigh;
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
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = () => {
    if (!validateForm()) return;

    updateMedication(id, {
      name,
      form,
      dosagePerUnit,
      unit,
      instructions,
      totalQuantity: Number(totalQuantity),
      remainingQuantity: Number(remainingQuantity),
      lowStockThreshold: Number(lowStockThreshold),
      trackStock,
      iconName: selectedIcon,
      iconColor: selectedIconColor,
    });

    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      translations.deleteMedication,
      translations.deleteMedicationConfirm,
      [
        {
          text: translations.cancel,
          style: "cancel",
        },
        {
          text: translations.delete,
          style: "destructive",
          onPress: () => {
            deleteMedication(id, true);
            router.back();
          },
        },
      ]
    );
  };

  if (!medication) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text>{translations.noMedicationsFound}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text>{translations.loading}...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteButton}
            >
              <Trash2 size={20} color={colors.error} />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        keyboardOpeningTime={Number.MAX_SAFE_INTEGER} // ios bounce temp-fix
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid
        extraScrollHeight={10}
        keyboardShouldPersistTaps="handled"
        enableResetScrollToCoords={false}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>
            {translations.medicationDetails}
          </Text>

          <IconSelector
            selectedIcon={selectedIcon}
            selectedColor={selectedIconColor}
            onSelectIcon={setSelectedIcon}
            onSelectColor={setSelectedIconColor}
            variant="edit"
          />

          <Input
            label={translations.medicationName}
            value={name}
            onChangeText={setName}
            placeholder="Парацетамол"
            error={errors.name}
          />

          <Text style={[styles.label, { marginBottom: 8 }]}>
            {translations.medicationForm}
          </Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={form}
              onValueChange={(value) => setForm(value)}
              style={[styles.picker, Platform.OS === "ios" && { height: 100 }]}
            >
              {Object.entries(MedicationForms).map(([key, label]) => (
                <Picker.Item key={key} label={label} value={key} />
              ))}
            </Picker>
          </View>

          {(form === "tablet" || form === "capsule") && (
            <Input
              label={`${translations.valuePerUnit} ${unit.slice(0, -1)}е`}
              desc={`  ${translations.optional}`}
              value={dosagePerUnit}
              onChangeText={setDosagePerUnit}
              placeholder="20 мг"
              error={errors.dosage}
            />
          )}

          <Input
            label={translations.instructions}
            desc={`  ${translations.optional}`}
            value={instructions}
            onChangeText={setInstructions}
            placeholder="Принимать с водой"
            multiline
            numberOfLines={3}
            accessoryViewID="instructionsEdit"
          />

          <View style={styles.trackRow}>
            <Text style={styles.label}>{translations.trackStock}</Text>
            <Switch
              value={trackStock}
              onValueChange={() =>
                setTrackStock((previousState) => !previousState)
              }
              trackColor={{
                false: colors.lightGray,
                true: colors.primary + "50",
              }}
              thumbColor={trackStock ? colors.primary : colors.mediumGray}
            />
          </View>

          {trackStock && (
            <>
              <View style={styles.rowInputs}>
                <Input
                  label={translations.totalQuantity}
                  value={totalQuantity}
                  onChangeText={(text) =>
                    setTotalQuantity(text.replace(",", "."))
                  }
                  placeholder="30"
                  keyboardType="numeric"
                  error={errors.totalQuantity}
                  style={{ flex: 1, marginRight: 8 }}
                  accessoryViewID="totalQuantityEdit"
                  rightIcon={
                    <Text style={{ color: colors.darkGray }}>
                      {pluralize(UnitsByForm[form][0], parseInt(totalQuantity))}
                    </Text>
                  }
                />

                <Input
                  label={translations.remainingQuantity}
                  value={remainingQuantity}
                  onChangeText={(text) =>
                    setRemainingQuantity(text.replace(",", "."))
                  }
                  placeholder="25"
                  keyboardType="numeric"
                  error={errors.remainingQuantity}
                  style={{ flex: 1, marginLeft: 8 }}
                  accessoryViewID="remainingQuantityEdit"
                  rightIcon={
                    <Text style={{ color: colors.darkGray }}>
                      {pluralize(
                        UnitsByForm[form][0],
                        parseInt(remainingQuantity)
                      )}
                    </Text>
                  }
                />
              </View>

              <Input
                label={translations.lowStockThreshold}
                value={lowStockThreshold}
                onChangeText={(text) =>
                  setLowStockThreshold(text.replace(",", "."))
                }
                placeholder="5"
                keyboardType="numeric"
                error={errors.lowStockThreshold}
                leftIcon={<AlertCircle size={20} color={colors.darkGray} />}
                accessoryViewID="lowStockThresholdEdit"
                rightIcon={
                  <Text style={{ color: colors.darkGray }}>
                    {pluralize(
                      UnitsByForm[form][0],
                      parseInt(lowStockThreshold)
                    )}
                  </Text>
                }
              />
            </>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={translations.updateMedication}
            onPress={handleUpdate}
            style={styles.saveButton}
          />

          <Button
            title={translations.cancelEdit}
            onPress={() => router.back()}
            variant="outline"
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
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
    marginTop: 18,
    flexDirection: "row",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 8,
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayButtonText: {
    fontSize: 12,
    color: colors.text,
  },
  dayButtonTextSelected: {
    color: colors.white,
  },
  mealRelationContainer: {
    marginBottom: 16,
  },
  mealRelationButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 8,
  },
  mealRelationButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mealRelationButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  mealRelationButtonTextSelected: {
    color: colors.white,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  saveButton: {
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: -8,
    marginBottom: 16,
  },
  deleteButton: {
    padding: 8,
  },
  scheduleContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  addTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    borderStyle: "dashed",
  },
  addTimeText: {
    color: colors.primary,
    fontWeight: "500",
    marginLeft: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  picker: {
    width: "100%",
    justifyContent: "center",
  },
  trackRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 40,
  },
});
