import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { Appearance, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemePreference = "light" | "dark" | "system";

type UserSettings = {
    username: string;
    avatarUri: string | null;
    themePreference: ThemePreference;
};

type UserSettingsContextValue = UserSettings & {
    resolvedColorScheme: "light" | "dark";
    isLoaded: boolean;
    updateUsername: (name: string) => Promise<void>;
    updateAvatarUri: (uri: string | null) => Promise<void>;
    updateThemePreference: (preference: ThemePreference) => Promise<void>;
};

const STORAGE_KEY = "@estudy/user-settings";

const DEFAULT_SETTINGS: UserSettings = {
    username: "Estudiante",
    avatarUri: null,
    themePreference: "system",
};

const UserSettingsContext = createContext<UserSettingsContextValue | null>(
    null
);

const applySystemColorScheme = (preference: ThemePreference) => {
    try {
        if (preference === "system") {
            Appearance.setColorScheme('auto');
        } else {
            Appearance.setColorScheme(preference);
        }
    } catch {
        // En web o entornos donde setColorScheme no esté soportado
    }
};

export function UserSettingsProvider({ children }: { children: ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw) as Partial<UserSettings>;
                    const merged: UserSettings = {
                        username: parsed.username ?? DEFAULT_SETTINGS.username,
                        avatarUri: parsed.avatarUri ?? null,
                        themePreference:
                            parsed.themePreference ??
                            DEFAULT_SETTINGS.themePreference,
                    };
                    setSettings(merged);
                    applySystemColorScheme(merged.themePreference);
                }
            } finally {
                setIsLoaded(true);
            }
        };

        loadSettings();
    }, []);

    const persistSettings = async (next: UserSettings) => {
        setSettings(next);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    };

    const updateUsername = async (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        await persistSettings({ ...settings, username: trimmed });
    };

    const updateAvatarUri = async (uri: string | null) => {
        await persistSettings({ ...settings, avatarUri: uri });
    };

    const updateThemePreference = async (preference: ThemePreference) => {
        applySystemColorScheme(preference);
        await persistSettings({ ...settings, themePreference: preference });
    };

    const resolvedColorScheme: "light" | "dark" =
        settings.themePreference === "system"
            ? systemColorScheme === "dark"
                ? "dark"
                : "light"
            : settings.themePreference;

    return (
        <UserSettingsContext.Provider
            value={{
                ...settings,
                resolvedColorScheme,
                isLoaded,
                updateUsername,
                updateAvatarUri,
                updateThemePreference,
            }}
        >
            {children}
        </UserSettingsContext.Provider>
    );
}

export function useUserSettings() {
    const context = useContext(UserSettingsContext);
    if (!context) {
        throw new Error(
            "useUserSettings debe usarse dentro de UserSettingsProvider"
        );
    }
    return context;
}