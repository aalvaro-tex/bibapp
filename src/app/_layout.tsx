import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { SubjectsProvider } from "@/context/subjects-context";
import { StudySessionProvider } from "@/context/study-session-context";
import { UserSettingsProvider } from "@/context/user-settings-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <UserSettingsProvider>
      <SubjectsProvider>
        <StudySessionProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="settings" />
            <Stack.Screen
              name="session-modal"
              options={{
                presentation: "fullScreenModal",
                animation: "slide_from_bottom",
              }}
            />

            <Stack.Screen
              name="subject-picker-modal"
              options={{
                presentation: "modal",
                sheetAllowedDetents: [0.65, 0.9],
                sheetGrabberVisible: true,
                sheetCornerRadius: 24,
                contentStyle: {
                  backgroundColor: isDark ? "#18181B" : "#FFFFFF",
                },
              }}
            />

            <Stack.Screen
              name="topic-modal"
              options={{
                presentation: "modal",
                contentStyle: {
                  backgroundColor: isDark ? "#18181B" : "#FFFFFF",
                },
              }}
            />

            <Stack.Screen
              name="session-summary"
              options={{
                presentation: "fullScreenModal",
                animation: "slide_from_bottom",
              }}
            />
          </Stack>
        </StudySessionProvider>
      </SubjectsProvider>
    </UserSettingsProvider >
  );
}