import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Image,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";
import { Stack, useRouter } from "expo-router";
import {
  MedicationForm,
  MedicationForms,
  pluralize,
  UnitsByForm,
} from "@/constants/medication";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { colors } from "@/constants/colors";
import { AlertCircle } from "lucide-react-native";
import { translations } from "@/constants/translations";
import { useMedicationStore } from "@/store/medication-store";
import { IconSelector } from "@/components/IconSelector";
import { useKeyboard } from "@/hooks/useKeyboard";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const ITEM_HEIGHT = 170;
const CENTER_SPACER = SCREEN_HEIGHT / 2 - ITEM_HEIGHT - 30;

export default function AddMedicationScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const [name, setName] = useState("");
  const [form, setForm] = useState<MedicationForm>("tablet");
  const [trackStock, setTrackStock] = useState(false);
  const [dosagePerUnit, setDosagePerUnit] = useState("");
  const [unit, setUnit] = useState(UnitsByForm[form][0][0]);
  const [instructions, setInstructions] = useState("");
  const [totalQuantity, setTotalQuantity] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedIcon, setSelectedIcon] = useState("Pill");
  const [selectedIconColor, setSelectedIconColor] = useState(colors.iconGreen);

  const { addMedication } = useMedicationStore();
  const { keyboardShown } = useKeyboard();

  useEffect(() => {
    setUnit(UnitsByForm[form][0][0]);
  }, [form]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = translations.required;

    if (trackStock) {
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    addMedication({
      name,
      form,
      dosagePerUnit,
      unit,
      instructions,
      totalQuantity: Number(totalQuantity),
      remainingQuantity: Number(totalQuantity),
      lowStockThreshold: Number(lowStockThreshold),
      trackStock,
      iconName: selectedIcon,
      iconColor: selectedIconColor,
    });

    router.back();
  };

  const formItems = [
    {
      key: "name",
      type: "input",
      label: translations.howMedicationNamed,
      render: () => (
        <Input
          value={name}
          onChangeText={setName}
          placeholder="Парацетамол"
          error={errors.name}
        />
      ),
    },
    {
      key: "iconSelector",
      label: translations.selectIcon,
      render: () => (
        <IconSelector
          selectedIcon={selectedIcon}
          selectedColor={selectedIconColor}
          onSelectIcon={setSelectedIcon}
          onSelectColor={setSelectedIconColor}
          variant="add"
        />
      ),
    },
    {
      key: "form",
      label: translations.medicationForm,
      render: () => (
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form}
            onValueChange={(value) => setForm(value)}
            style={
              Platform.OS === "ios"
                ? [styles.picker, { height: 100 }]
                : styles.picker
            }
          >
            {Object.entries(MedicationForms).map(([key, label]) => (
              <Picker.Item key={key} label={label} value={key} />
            ))}
          </Picker>
        </View>
      ),
    },
    ...(form === "tablet" || form === "capsule"
      ? [
          {
            key: "dosagePerUnit",
            label: `${translations.valuePerUnitAdd} ${unit.slice(0, -1)}е?`,
            render: () => (
              <Input
                value={dosagePerUnit}
                onChangeText={(text) => setDosagePerUnit(text.replaceAll(",", "."))}
                placeholder="20 мг    * опционально"
                error={errors.dosage}
              />
            ),
          },
        ]
      : []),
    {
      key: "instructions",
      label: translations.addInstructions,
      render: () => (
        <Input
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Принимать с водой    * опционально"
          multiline
          numberOfLines={3}
          accessoryViewID="instructions"
        />
      ),
    },
    {
      key: "trackStock",
      label: translations.setTrackStock,
      render: () => (
        <View style={styles.choiceRow}>
          <Button
            title={translations.yesPlease}
            onPress={() => setTrackStock(true)}
            style={trackStock ? styles.choiceButtonActive : styles.choiceButton}
            textStyle={
              trackStock
                ? styles.choiceButtonActiveText
                : styles.choiceButtonText
            }
          />
          <Button
            title={translations.noThanks}
            onPress={() => setTrackStock(false)}
            style={
              !trackStock ? styles.choiceButtonActive : styles.choiceButton
            }
            textStyle={
              !trackStock
                ? styles.choiceButtonActiveText
                : styles.choiceButtonText
            }
          />
        </View>
      ),
    },
    ...(trackStock
      ? [
          {
            key: "totalQuantity",
            label: translations.currentState,
            render: () => (
              <View style={[styles.rowInputs]}>
                <Input
                  label={translations.totalQuantity}
                  value={totalQuantity}
                  onChangeText={(text) =>
                    setTotalQuantity(text.replace(",", "."))
                  }
                  placeholder="30"
                  keyboardType="numeric"
                  error={errors.totalQuantity}
                  style={{ marginRight: 8 }}
                  rightIcon={
                    <Text style={{ color: colors.darkGray }}>{pluralize(UnitsByForm[form][0], parseInt(totalQuantity))}</Text>
                  }
                  accessoryViewID="totalQuantity"
                />
                <Input
                  label={translations.lowStockThreshold}
                  value={lowStockThreshold}
                  onChangeText={(text) =>
                    setLowStockThreshold(text.replace(",", "."))
                  }
                  placeholder="5"
                  keyboardType="numeric"
                  error={errors.lowStockThreshold}
                  style={{ marginLeft: 8 }}
                  leftIcon={<AlertCircle size={20} color={colors.darkGray} />}
                  rightIcon={
                    <Text style={{ color: colors.darkGray }}>{pluralize(UnitsByForm[form][0], parseInt(lowStockThreshold))}</Text>
                  }
                  accessoryViewID="lowStockThreshold"
                />
              </View>
            ),
          },
        ]
      : []),
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} hitSlop={20}>
              <Text style={styles.readyButton}>{translations.done}</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        keyboardOpeningTime={Number.MAX_SAFE_INTEGER} // ios bounce temp-fix
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={40}
        enableOnAndroid
        enableResetScrollToCoords={false}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={32} // вызывает onScroll каждые 32 мс
        removeClippedSubviews={true} // android scroll lags fix
        onScroll={(e) => {
          scrollY.setValue(e.nativeEvent.contentOffset.y);
        }}
        keyboardDismissMode="on-drag"
      >
        <Image
          style={styles.pattern}
          source={require("../../assets/images/background-pattern-top.png")}
        />

        {formItems.map((item, index) => {
          const inputRange = [
            (index - 1) * ITEM_HEIGHT,
            index * ITEM_HEIGHT,
            (index + 1) * ITEM_HEIGHT,
          ];

          const opacity = scrollY.interpolate({
                inputRange,
                outputRange: [0.5, 1, 0.5],
                extrapolate: "clamp",
              });

          return (
            <Animated.View
              key={item.key}
              style={[styles.itemContainer, { opacity }]}
            >
              <Text style={styles.label}>{item.label}</Text>
              {item.render()}
            </Animated.View>
          );
        })}

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

        <Image
          style={styles.pattern}
          source={require("../../assets/images/background-pattern-bottom.png")}
        />
      </KeyboardAwareScrollView>

      <LinearGradient
        colors={["rgba(248, 249, 250, 0.5)", "rgba(255, 255, 255, 0)"]}
        style={[styles.gradient, { top: 0, height: "20%" }]}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["rgba(255, 255, 255, 0)", "rgba(248, 249, 250, 0.5)"]}
        style={[
          styles.gradient,
          { bottom: 0, height: "20%" },
          keyboardShown && { opacity: 0 },
        ]}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  itemContainer: {
    paddingHorizontal: 22,
    justifyContent: "center",
    marginVertical: 20,
  },
  label: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 18,
    color: colors.text,
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
  choiceRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  choiceButton: {
    padding: 12,
    backgroundColor: colors.lightGray,
    width: "38%",
  },
  choiceButtonText: {
    color: colors.text,
  },
  choiceButtonActive: {
    backgroundColor: colors.primary,
    width: "58%",
  },
  choiceButtonActiveText: {
    color: colors.white,
  },
  rowInputs: {
    flexDirection: "row",
  },
  gradient: {
    position: "absolute",
    width: "100%",
    zIndex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 22,
    justifyContent: "center",
    marginVertical: 20,
  },
  saveButton: {
    marginBottom: 12,
  },
  pattern: {
    height: CENTER_SPACER,
    width: "100%",
    zIndex: 0,
    opacity: 0.2,
    marginTop: -5,
  },
  readyButton: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "500",
  },
});
