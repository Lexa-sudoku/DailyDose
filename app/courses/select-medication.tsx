import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Search } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useMedicationStore } from "@/store/medication-store";
import { translations } from "@/constants/translations";
import { MedicationIcon } from "@/components/MedicationIcon";
import { MedicationForms } from "@/constants/medication";
import { Medication } from "@/types";

export default function SelectMedicationScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const { medications } = useMedicationStore();

  const filteredMedications = medications.filter((med) =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectMedication = (medicationId: string) => {
    router.replace(`/courses/add?medicationId=${medicationId}`);
  };

  const navigateToAddMedication = () => {
    router.push("/medications/add");
  };

  const renderItem = ({ item }: { item: Medication }) => (
    <TouchableOpacity
      style={styles.medicationItem}
      onPress={() => handleSelectMedication(item.id)}
    >
      <View style={styles.medicationIcon}>
        <MedicationIcon
          iconName={item.iconName || "Pill"}
          color={item.iconColor || colors.primary}
          size={24}
        />
      </View>
      <View style={styles.medicationInfo}>
        <Text style={styles.medicationName}>{item.name}</Text>
        <Text style={styles.medicationDosage}>
          {MedicationForms[item.form]}
          {item.dosagePerUnit ? `, ${item.dosagePerUnit}` : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery
          ? translations.noMedicationsFound
          : translations.noMedicationsAddedYet}
      </Text>
      <Button
        title={translations.addNewMedication}
        onPress={navigateToAddMedication}
        style={styles.addButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Button
              title={translations.add}
              onPress={navigateToAddMedication}
              variant="text"
              icon={<Plus size={18} color={colors.primary} />}
            />
          ),
        }}
      />

      <View style={styles.searchContainer}>
        <Input
          placeholder={translations.searchMedications}
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color={colors.darkGray} />}
        />
      </View>

      <FlatList
        data={filteredMedications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: 16,
    height: 82,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  medicationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medicationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  addButton: {
    minWidth: 200,
  },
});
