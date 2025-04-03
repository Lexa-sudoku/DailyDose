import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { formatDateTime } from "./date-utils";

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push token for push notification!");
    return;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;

  return token;
}

export async function scheduleMedicationReminder(
  medicationName: string,
  dosage: string,
  date: string,
  time: string,
  minutesBefore: number,
) {
  // Создаем дату и время напоминания
  const scheduledDateTime = formatDateTime(date, time);
  const reminderTime = new Date(
    scheduledDateTime.getTime() - minutesBefore * 60 * 1000, // todo понять что за время тут считается
  );

  // Если время напоминания уже прошло, не планируем уведомление
  if (reminderTime < new Date()) {
    return null;
  }

  // Планируем уведомление
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Напоминание о приеме лекарства",
      body: `Пора принять ${medicationName} (${dosage})`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data: { medicationName, dosage, date, time },
    },
    trigger: null, // todo вместо null надо понять как корректно вставить ReminderTime
  });

  return identifier;
}

export async function scheduleLowStockReminder(
  medicationName: string,
  remainingQuantity: number,
) {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Низкий запас лекарства",
      body: `У вас осталось только ${remainingQuantity} единиц ${medicationName}. Пора пополнить запас.`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data: { medicationName, remainingQuantity },
    },
    trigger: null, // Немедленное уведомление
  });

  return identifier;
}

export async function cancelNotification(identifier: string) {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
