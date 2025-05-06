import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, AlertCircle } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { translations } from "@/constants/translations";
import { useSettingsStore } from "@/store/settings-store";
import { Button } from "@/components/Button";
import {
  cancelAllNotifications,
  registerForPushNotificationsAsync,
  rescheduleAllCourseNotifications,
} from "@/utils/notification-utils";
import { useNotificationStore } from "@/store/notification-store";
import { ErrorModal } from "@/components/ErrorModal";

export default function NotificationsScreen() {
  const { notificationSettings, updateNotificationSettings } =
    useSettingsStore();
  const { clearAllNotifications } = useNotificationStore();
  const [isRegistering, setIsRegistering] = useState(false);

  const toggleMedicationReminders = () => {
    const newValue = !notificationSettings.medicationRemindersEnabled;
    updateNotificationSettings({
      medicationRemindersEnabled: newValue,
    });

    if (!newValue) {
      cancelAllNotifications();
      clearAllNotifications();
    } else {
      rescheduleAllCourseNotifications(
        notificationSettings.minutesBeforeScheduledTime
      );
    }
  };

  const toggleLowStockReminders = () => {
    updateNotificationSettings({
      lowStockRemindersEnabled: !notificationSettings.lowStockRemindersEnabled,
    });
  };

  const updateReminderTime = (minutes: number) => {
    updateNotificationSettings({
      minutesBeforeScheduledTime: minutes,
    });
    rescheduleAllCourseNotifications(minutes);
  };

  const requestNotificationPermissions = async () => {
    setIsRegistering(true);
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        console.warn("Expo push token:", token);
      }
    } catch (error) {
      console.error("Error registering for push notifications:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>
              {translations.medicationReminders}
            </Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{translations.enabled}</Text>
              <Text style={styles.settingDescription}>
                {notificationSettings.medicationRemindersEnabled
                  ? "Уведомления о приеме лекарств включены"
                  : "Уведомления о приеме лекарств выключены"}
              </Text>
            </View>
            <Switch
              value={notificationSettings.medicationRemindersEnabled}
              onValueChange={toggleMedicationReminders}
              trackColor={{
                false: colors.lightGray,
                true: colors.primary + "50",
              }}
              thumbColor={
                notificationSettings.medicationRemindersEnabled
                  ? colors.primary
                  : colors.mediumGray
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>
                {translations.reminderTime}
              </Text>
              <Text style={styles.settingDescription}>
                {notificationSettings.minutesBeforeScheduledTime}{" "}
                {translations.minutesBefore}
              </Text>
            </View>
            <View style={styles.timeButtons}>
              <Button
                title="5"
                onPress={() => updateReminderTime(5)}
                variant={
                  notificationSettings.minutesBeforeScheduledTime === 5
                    ? "primary"
                    : "outline"
                }
                size="small"
                style={styles.timeButton}
              />
              <Button
                title="15"
                onPress={() => updateReminderTime(15)}
                variant={
                  notificationSettings.minutesBeforeScheduledTime === 15
                    ? "primary"
                    : "outline"
                }
                size="small"
                style={styles.timeButton}
              />
              <Button
                title="30"
                onPress={() => updateReminderTime(30)}
                variant={
                  notificationSettings.minutesBeforeScheduledTime === 30
                    ? "primary"
                    : "outline"
                }
                size="small"
                style={styles.timeButton}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertCircle size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>
              {translations.lowStockReminders}
            </Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{translations.enabled}</Text>
              <Text style={styles.settingDescription}>
                {notificationSettings.lowStockRemindersEnabled
                  ? "Уведомления о низком запасе лекарств включены"
                  : "Уведомления о низком запасе лекарств выключены"}
              </Text>
            </View>
            <Switch
              value={notificationSettings.lowStockRemindersEnabled}
              onValueChange={toggleLowStockReminders}
              trackColor={{
                false: colors.lightGray,
                true: colors.primary + "50",
              }}
              thumbColor={
                notificationSettings.lowStockRemindersEnabled
                  ? colors.primary
                  : colors.mediumGray
              }
            />
          </View>
        </View>

        <Button
          title="Разрешить уведомления"
          onPress={requestNotificationPermissions}
          loading={isRegistering}
          style={styles.permissionButton}
        />
      </ScrollView>
    <ErrorModal />
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
  section: {
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    // borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  timeButtons: {
    flexDirection: "row",
  },
  timeButton: {
    marginLeft: 8,
    minWidth: 40,
  },
  permissionButton: {
    marginBottom: 24,
  },
});
