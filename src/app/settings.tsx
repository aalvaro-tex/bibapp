import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import {
    ThemePreference,
    useUserSettings,
} from "@/context/user-settings-context";
import { GlassView } from "expo-glass-effect";

const THEME_OPTIONS: {
    value: ThemePreference;
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
        { value: "light", label: "Claro", icon: "light-mode" },
        { value: "dark", label: "Oscuro", icon: "dark-mode" },
        { value: "system", label: "Sistema", icon: "settings-brightness" },
    ];

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const {
        username,
        avatarUri,
        themePreference,
        resolvedColorScheme,
        updateUsername,
        updateAvatarUri,
        updateThemePreference,
    } = useUserSettings();

    const [draftUsername, setDraftUsername] = useState(username);
    const [savedFeedback, setSavedFeedback] = useState(false);

    useEffect(() => {
        setDraftUsername(username);
    }, [username]);

    const isDark = resolvedColorScheme === "dark";
    const bgColor = isDark ? "#000000" : "#FFFFFF";
    const cardBg = isDark ? "#18181B" : "#F4F4F5";
    const inputBg = isDark ? "#27272A" : "#FFFFFF";
    const borderColor = isDark ? "#27272A" : "#E4E4E7";
    const textColor = isDark ? "#FFFFFF" : "#000000";
    const secondaryColor = isDark ? "#A1A1AA" : "#71717A";
    const buttonBg = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.05)";

    const hasUsernameChanged =
        draftUsername.trim().length > 0 && draftUsername.trim() !== username;

    const handlePickImage = async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert(
                "Permiso necesario",
                "Concede acceso a tu galería para poder elegir una foto de perfil."
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]?.uri) {
            await updateAvatarUri(result.assets[0].uri);
        }
    };

    const handleRemoveImage = () => {
        Alert.alert(
            "Eliminar foto de perfil",
            "¿Quieres quitar tu imagen de perfil actual?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => updateAvatarUri(null),
                },
            ]
        );
    };

    const handleSaveUsername = async () => {
        if (!hasUsernameChanged) return;
        await updateUsername(draftUsername);
        setSavedFeedback(true);
        setTimeout(() => setSavedFeedback(false), 2000);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[styles.container, { backgroundColor: bgColor }]}
        >
            {/* Cabecera */}
            <View
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top + Spacing.three,
                        borderBottomColor: borderColor,
                    },
                ]}
            >
                <Pressable
                    onPress={() => router.back()}
                    accessibilityLabel="Minimizar sesión"
                >
                    <GlassView
                        style={[styles.nativeGlassButton, { marginRight: Spacing.three }]}
                        glassEffectStyle="regular"
                        isInteractive
                    >
                        <MaterialIcons
                            name="chevron-left"
                            size={24}
                            color={isDark ? "#FFFFFF" : "#000000"}
                        />
                    </GlassView>
                </Pressable>
                <ThemedText type="title">Ajustes</ThemedText>
            </View>

            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: Math.max(insets.bottom, 24) + Spacing.four },
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Sección: Imagen de perfil */}
                <View
                    style={[
                        styles.sectionCard,
                        { backgroundColor: cardBg, borderColor },
                    ]}
                >
                    <Text style={[styles.sectionTitle, { color: secondaryColor }]}>
                        Imagen de perfil
                    </Text>

                    <View style={styles.avatarRow}>
                        <Pressable
                            onPress={handlePickImage}
                            accessibilityLabel="Cambiar imagen de perfil"
                            style={({ pressed }) => [
                                styles.avatarWrapper,
                                { borderColor },
                                pressed && styles.pressed,
                            ]}
                        >
                            {avatarUri ? (
                                <Image
                                    source={{ uri: avatarUri }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <View
                                    style={[
                                        styles.avatarPlaceholder,
                                        {
                                            backgroundColor: isDark
                                                ? "#27272A"
                                                : "#E4E4E7",
                                        },
                                    ]}
                                >
                                    <MaterialIcons
                                        name="person"
                                        size={44}
                                        color={secondaryColor}
                                    />
                                </View>
                            )}

                            <View style={styles.cameraBadge}>
                                <MaterialIcons
                                    name="photo-camera"
                                    size={15}
                                    color="#FFFFFF"
                                />
                            </View>
                        </Pressable>

                        <View style={styles.avatarActions}>
                            <Pressable
                                onPress={handlePickImage}
                                style={({ pressed }) => [
                                    styles.secondaryActionButton,
                                    {
                                        backgroundColor: inputBg,
                                        borderColor,
                                    },
                                    pressed && styles.pressed,
                                ]}
                            >
                                <MaterialIcons
                                    name="photo-library"
                                    size={18}
                                    color={textColor}
                                />
                                <Text
                                    style={[
                                        styles.secondaryActionText,
                                        { color: textColor },
                                    ]}
                                >
                                    {avatarUri
                                        ? "Cambiar foto"
                                        : "Subir desde galería"}
                                </Text>
                            </Pressable>

                            {avatarUri && (
                                <Pressable
                                    onPress={handleRemoveImage}
                                    style={({ pressed }) => [
                                        styles.removePhotoButton,
                                        pressed && styles.pressed,
                                    ]}
                                >
                                    <Text style={styles.removePhotoText}>
                                        Eliminar foto
                                    </Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                </View>

                {/* Sección: Nombre de usuario */}
                <View
                    style={[
                        styles.sectionCard,
                        { backgroundColor: cardBg, borderColor },
                    ]}
                >
                    <Text style={[styles.sectionTitle, { color: secondaryColor }]}>
                        Nombre de usuario
                    </Text>

                    <TextInput
                        value={draftUsername}
                        onChangeText={setDraftUsername}
                        placeholder="Tu nombre de usuario"
                        placeholderTextColor={secondaryColor}
                        maxLength={30}
                        returnKeyType="done"
                        onSubmitEditing={handleSaveUsername}
                        style={[
                            styles.input,
                            {
                                backgroundColor: inputBg,
                                color: textColor,
                                borderColor,
                            },
                        ]}
                    />

                    <Pressable
                        disabled={!hasUsernameChanged}
                        onPress={handleSaveUsername}
                        style={[
                            styles.savePressable,
                            !hasUsernameChanged && { opacity: 0.45 },
                        ]}
                    >
                        {({ pressed }) => (
                            <LinearGradient
                                colors={
                                    pressed
                                        ? ["#151519", "#3f5e43"]
                                        : ["#1d1d23", "#5a835f"]
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.saveButton}
                            >
                                <MaterialIcons
                                    name={savedFeedback ? "check" : "save"}
                                    size={18}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.saveButtonText}>
                                    {savedFeedback
                                        ? "Nombre guardado"
                                        : "Guardar nombre"}
                                </Text>
                            </LinearGradient>
                        )}
                    </Pressable>
                </View>

                {/* Sección: Apariencia / Tema */}
                <View
                    style={[
                        styles.sectionCard,
                        { backgroundColor: cardBg, borderColor },
                    ]}
                >
                    <Text style={[styles.sectionTitle, { color: secondaryColor }]}>
                        Tema de la aplicación
                    </Text>

                    <View style={styles.themeOptionsRow}>
                        {THEME_OPTIONS.map((option) => {
                            const isSelected = themePreference === option.value;
                            return (
                                <Pressable
                                    key={option.value}
                                    onPress={() =>
                                        updateThemePreference(option.value)
                                    }
                                    style={({ pressed }) => [
                                        styles.themeOption,
                                        {
                                            backgroundColor: inputBg,
                                            borderColor: isSelected
                                                ? "#5a835f"
                                                : borderColor,
                                        },
                                        isSelected && styles.themeOptionSelected,
                                        pressed && styles.pressed,
                                    ]}
                                >
                                    <MaterialIcons
                                        name={option.icon}
                                        size={22}
                                        color={
                                            isSelected
                                                ? "#5a835f"
                                                : secondaryColor
                                        }
                                    />
                                    <Text
                                        style={[
                                            styles.themeOptionLabel,
                                            {
                                                color: isSelected
                                                    ? textColor
                                                    : secondaryColor,
                                            },
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingHorizontal: Spacing.four,
        paddingBottom: Spacing.three,

        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    pressed: {
        opacity: 0.75,
        transform: [{ scale: 0.97 }],
    },
    scrollContent: {
        padding: Spacing.four,
        gap: 16,
    },
    sectionCard: {
        borderRadius: 16,
        borderWidth: StyleSheet.hairlineWidth,
        padding: 16,
        gap: 14,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.4,
    },
    avatarRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    avatarWrapper: {
        width: 84,
        height: 84,
        borderRadius: 42,
        borderWidth: 1,
        position: "relative",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
        borderRadius: 42,
    },
    avatarPlaceholder: {
        width: "100%",
        height: "100%",
        borderRadius: 42,
        alignItems: "center",
        justifyContent: "center",
    },
    cameraBadge: {
        position: "absolute",
        right: 0,
        bottom: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#5a835f",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#18181B",
    },
    avatarActions: {
        flex: 1,
        gap: 8,
    },
    secondaryActionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 42,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
    },
    secondaryActionText: {
        fontSize: 14,
        fontWeight: "600",
    },
    removePhotoButton: {
        alignSelf: "flex-start",
        paddingVertical: 4,
        paddingHorizontal: 4,
    },
    removePhotoText: {
        color: "#EF4444",
        fontSize: 13,
        fontWeight: "500",
    },
    input: {
        height: 48,
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 14,
        fontSize: 16,
    },
    savePressable: {
        width: "100%",
    },
    saveButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 46,
        borderRadius: 12,
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
    themeOptionsRow: {
        flexDirection: "row",
        gap: 10,
    },
    themeOption: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    themeOptionSelected: {
        borderWidth: 2,
    },
    themeOptionLabel: {
        fontSize: 13,
        fontWeight: "600",
    },
    nativeGlassButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
});