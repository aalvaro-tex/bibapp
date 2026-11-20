import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function scheduleBreakEndingNotification(totalBreakSeconds: number) {
    if (totalBreakSeconds <= 0) return null;

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("break-reminders", {
            name: "Avisos de descanso",
            importance: Notifications.AndroidImportance.HIGH,
        });
    }

    const permissions = await Notifications.getPermissionsAsync();
    let finalStatus = permissions.status;

    if (finalStatus !== "granted") {
        const requested = await Notifications.requestPermissionsAsync();
        finalStatus = requested.status;
    }

    if (finalStatus !== "granted") {
        return null;
    }

    const leadSeconds =
        totalBreakSeconds > 90 ? 60 : totalBreakSeconds > 20 ? 15 : 0;
    const triggerInSeconds = Math.max(1, totalBreakSeconds - leadSeconds);

    const body =
        leadSeconds > 0
            ? `Queda ${leadSeconds === 60 ? "1 minuto" : `${leadSeconds} segundos`
            } para volver a estudiar.`
            : "¡Se ha acabado el tiempo de descanso! Toca volver a estudiar.";

    const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
            title: "Descanso casi terminado",
            body,
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: triggerInSeconds,
            repeats: false,
            ...(Platform.OS === "android" ? { channelId: "break-reminders" } : {}),
        },
    });

    return notificationId;
}

export async function cancelBreakEndingNotification(
    notificationId: string | null
) {
    if (!notificationId) return;
    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch {
        // Ignorar si ya fue entregada o cancelada
    }
}