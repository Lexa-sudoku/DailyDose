import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { addDays, isBefore, parseISO, set } from "date-fns";
import { MedicationSchedule } from "@/types";
import { useNotificationStore } from "@/store/notification-store";
import { useMedicationStore } from "@/store/medication-store";
import { getCourseActiveDates } from "./course-utils";
import { translations } from "@/constants/translations";
import { getUnitDisplayFromRaw } from "@/constants/medication";

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
    console.warn("Failed to get push token for push notification!");
    return;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;

  return token;
}

export async function scheduleCourseNotifications(
  schedule: MedicationSchedule,
  medicationName: string,
  minutesBefore: number
): Promise<string[]> {
  const { frequency, startDate, endDate, durationDays, times, days, dates } =
    schedule;

  const notificationDates = getCourseActiveDates(
    frequency,
    startDate,
    endDate,
    durationDays,
    days,
    dates
  );
  const identifiers: string[] = [];

  for (const date of notificationDates) {
    for (const { time, dosage, unit } of times) {
      const [hour, minute] = time.split(":").map(Number);

      const scheduledDateTime = set(date, {
        hours: hour,
        minutes: minute,
        seconds: 0,
        milliseconds: 0,
      });

      const reminderTime = new Date(
        scheduledDateTime.getTime() - minutesBefore * 60 * 1000
      );

      if (reminderTime < new Date()) {
        continue;
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Пора принять ${medicationName}`,
          body: `Примите ${dosage} ${getUnitDisplayFromRaw(unit, Number(dosage))} в ${time}`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { medicationName, dosage, unit, date, time },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderTime,
        },
      });

      identifiers.push(identifier);
    }
  }
  return identifiers;
}

export async function scheduleLowStockReminder(
  medicationName: string,
  remainingQuantity: number,
  unit: string
) {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Пора пополнить запас",
      body: `У вас осталось всего ${remainingQuantity} ${unit} ${medicationName}`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data: { medicationName, remainingQuantity },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
      repeats: false,
    },
  });

  return identifier;
}

export async function cancelNotifications(identifiers: string[]) {
  for (const id of identifiers) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (error) {
      console.warn(`Failed to cancel notification ${id}:`, error);
    }
  }
}

export async function rescheduleCourseNotifications(
  oldIdentifiers: string[],
  schedule: MedicationSchedule,
  medicationName: string,
  minutesBefore: number
): Promise<string[]> {
  await cancelNotifications(oldIdentifiers);

  const newIdentifiers = await scheduleCourseNotifications(
    schedule,
    medicationName,
    minutesBefore
  );

  return newIdentifiers;
}

export async function rescheduleAllCourseNotifications(
  newMinutesBefore: number
) {
  const { notifications, setNotifications, clearNotifications } =
    useNotificationStore.getState();
  const { getScheduleById, getMedicationById } = useMedicationStore.getState();

  for (const scheduleId of Object.keys(notifications)) {
    const schedule = getScheduleById(scheduleId);

    if (!schedule) {
      clearNotifications(scheduleId); // удаляем уведомления из стора, если курс не найден/удален
      continue;
    }

    const medication = getMedicationById(schedule.medicationId);

    const oldIdentifiers = notifications[scheduleId];
    const newIdentifiers = await rescheduleCourseNotifications(
      oldIdentifiers,
      schedule,
      medication?.name || translations.medication,
      newMinutesBefore
    );

    setNotifications(scheduleId, newIdentifiers);
  }
}

export async function cleanupExpiredCourseNotifications() {
  const { notifications, clearNotifications } = useNotificationStore.getState();
  const { getScheduleById } = useMedicationStore.getState();
  const now = new Date();

  for (const scheduleId of Object.keys(notifications)) {
    const course = getScheduleById(scheduleId);

    if (!course) {
      clearNotifications(scheduleId); // удаляем уведомления из стора, если курс не найден/удален
      continue;
    }

    const endDate = course.endDate
      ? addDays(parseISO(course.endDate), 1)
      : course.durationDays
        ? addDays(parseISO(course.startDate), course.durationDays + 1)
        : null;

    if (!endDate) continue;

    const isExpired = isBefore(endDate, now);

    if (isExpired) {
      clearNotifications(scheduleId);
    }
  }
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
