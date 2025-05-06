import React from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";
import { useErrorStore } from "@/store/error-store";
import { translations } from "@/constants/translations";
import { colors } from "@/constants/colors";
import { extractErrorMessageString } from "@/utils/error-utils";

export const ErrorModal = () => {
  const { error, setError } = useErrorStore();

  if (!error) return null;

  return (
    <Modal
      visible={!!error}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setError(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>API Error</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusNumber}>{error.status}</Text>
            <View style={styles.errorDetails}>
              <Text style={styles.text}>
                {extractErrorMessageString(error.details)}
              </Text>
            </View>
          </View>

          <Button
            title={translations.close}
            onPress={() => setError(null)}
            color={colors.primary}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    marginLeft: 10,
  },
  statusNumber: {
    fontSize: 40,
    fontWeight: "bold",
    marginRight: 22,
    color: colors.primary,
  },
  errorDetails: {
    flex: 1,
    justifyContent: "center", // Вертикальное выравнивание
    lineHeight: 40,
  },
  text: {
    fontSize: 15,
  },
});
