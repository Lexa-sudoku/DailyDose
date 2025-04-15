import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { translations } from "@/constants/translations";
import { MealRelation } from "@/types";
import { colors } from "@/constants/colors";

interface ScheduleMealRelationProps {
  mealRelation: MealRelation;
  onMealRelationChange: (mealRelation: MealRelation) => void;
}

export const ScheduleMealRelation: React.FC<ScheduleMealRelationProps> = ({
  mealRelation,
  onMealRelationChange,
}) => {
  const mealRelationOptions: { value: MealRelation; label: string }[] = [
    { value: "before_meal", label: translations.beforeMeal },
    { value: "with_meal", label: translations.withMeal },
    { value: "after_meal", label: translations.afterMeal },
    { value: "no_relation", label: translations.noMealRelation },
  ];
  return (
    <View style={styles.mealRelationContainer}>
      {mealRelationOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.mealRelationButton,
            mealRelation === option.value && styles.mealRelationButtonSelected,
          ]}
          onPress={() => onMealRelationChange(option.value as any)}
        >
          <Text
            style={[
              styles.mealRelationButtonText,
              mealRelation === option.value &&
                styles.mealRelationButtonTextSelected,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  mealRelationContainer: {
    marginBottom: 8,
  },
  mealRelationButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: colors.white,
  },
  mealRelationButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mealRelationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  mealRelationButtonTextSelected: {
    color: colors.white,
  },
});
