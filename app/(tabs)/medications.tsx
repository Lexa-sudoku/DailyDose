import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from "react-native";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Pill, AlertTriangle } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { MedicationInventoryCard } from "@/components/MedicationInventoryCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { useMedicationStore } from "@/store/medication-store";
import { translations } from "@/constants/translations";

export default function MedicationsScreen() {
  const { medications, getLowStockMedications } = useMedicationStore();
  const lowStockMedications = getLowStockMedications();

  const navigateToAddMedication = () => {
    router.push("/medications/add");
  };

  const navigateToEditMedication = (id: string) => {
    router.push(`/medications/${id}`);
  };

  const renderItem = ({ item }: { item: any }) => (
    <MedicationInventoryCard
      medication={item}
      onEdit={() => navigateToEditMedication(item.id)}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      icon={<Pill size={40} color={colors.primary} />}
      title={translations.noMedicationsAdded}
      description={translations.noMedicationsAddedDesc}
      buttonTitle={translations.addMedication}
      onButtonPress={navigateToAddMedication}
    />
  );

  const renderLowStockWarning = () => {
    if (lowStockMedications.length === 0) return null;

    return (
      <View style={styles.warningContainer}>
        <View style={styles.warningHeader}>
          <AlertTriangle size={20} color={colors.error} />
          <Text style={styles.warningTitle}>{translations.lowStockAlert}</Text>
        </View>
        <Text style={styles.warningText}>
          {lowStockMedications.length === 1
            ? `${lowStockMedications[0].name} ${translations.lowStockSingle}`
            : `${lowStockMedications.length} ${translations.lowStockMultiple}`}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <Stack.Screen
        options={{
          title: translations.myMedications,
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

      <FlatList
        data={medications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderLowStockWarning}
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
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  warningContainer: {
    backgroundColor: colors.error + "15", // 15% opacity
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.error,
    marginLeft: 8,
  },
  warningText: {
    fontSize: 14,
    color: colors.text,
  },
});
