import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useStudySession } from "@/context/study-session-context";
import { BreakDurationDialog } from "@/components/break-duration-dialog";
import { Spacing } from "@/constants/theme";

type FloatingSessionBarProps = {
    tabBarHeight?: number;
    onStartBreak?: () => void;
};

export function FloatingSessionBar({
    tabBarHeight = 66,
    onStartBreak,
}: FloatingSessionBarProps) {
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const [isBreakDialogVisible, setIsBreakDialogVisible] = useState(false);

    const {
        isSessionActive,
        isModalVisible,
        formattedElapsedTime,
        studiedTopicsCount,
        isOnBreak,
        formattedBreakRemainingTime,
        reopenSession,
        startBreak,
        cancelBreak,
    } = useStudySession();

    if (!isSessionActive || isModalVisible) {
        return null;
    }

    const isDark = colorScheme === "dark";
    const supportsLiquidGlass = isLiquidGlassAvailable();
    const buttonBg = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)";
    const iconColor = isDark ? "#FFFFFF" : "#000000";

    const handleBreakPress = () => {
        if (isOnBreak) {
            Alert.alert(
                "Finalizar descanso",
                "¿Quieres finalizar el descanso actual y volver a estudiar?",
                [
                    {
                        text: "Cancelar",
                        style: "cancel",
                    },
                    {
                        text: "Finalizar",
                        style: "default",
                        onPress: () => {
                            cancelBreak();
                        },
                    },
                ]
            );
            return;
        }

        if (onStartBreak) {
            onStartBreak();
        } else {
            setIsBreakDialogVisible(true);
        }
    };

    return (
        <>
            <View
                pointerEvents="box-none"
                style={[
                    styles.wrapper,
                    { bottom: insets.bottom + tabBarHeight + 5 },
                ]}
            >
                <GlassView
                    glassEffectStyle="regular"
                    isInteractive
                    style={[
                        styles.bar,
                        !supportsLiquidGlass &&
                        (isDark ? styles.barFallbackDark : styles.barFallbackLight),
                    ]}
                >
                    <Pressable
                        onPress={reopenSession}
                        accessibilityLabel="Volver a abrir la sesión"
                        style={styles.metrics}
                    >
                        <View style={styles.metricBlock}>
                            <Text
                                style={[
                                    styles.label,
                                    { color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.60)" },
                                ]}
                            >
                                Tiempo
                            </Text>
                            <Text
                                style={[
                                    styles.value,
                                    styles.timerValue,
                                    { color: iconColor },
                                ]}
                            >
                                {formattedElapsedTime}
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.divider,
                                {
                                    backgroundColor: isDark
                                        ? "rgba(255,255,255,0.18)"
                                        : "rgba(0,0,0,0.12)",
                                },
                            ]}
                        />

                        <View style={styles.metricBlock}>
                            <Text
                                style={[
                                    styles.label,
                                    { color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.60)" },
                                ]}
                            >
                                Temas
                            </Text>
                            <Text style={[styles.value, { color: iconColor }]}>
                                {studiedTopicsCount}
                            </Text>
                        </View>

                        {isOnBreak && (
                            <>
                                <View
                                    style={[
                                        styles.divider,
                                        {
                                            backgroundColor: isDark
                                                ? "rgba(255,255,255,0.18)"
                                                : "rgba(0,0,0,0.12)",
                                        },
                                    ]}
                                />

                                <View style={styles.metricBlock}>
                                    <Text style={[styles.label, { color: "#22C55E" }]}>
                                        Descanso
                                    </Text>
                                    <Text
                                        style={[
                                            styles.value,
                                            styles.timerValue,
                                            { color: "#22C55E" },
                                        ]}
                                    >
                                        {formattedBreakRemainingTime}
                                    </Text>
                                </View>
                            </>
                        )}
                    </Pressable>

                    <View style={styles.actions}>
                        <Pressable
                            onPress={handleBreakPress}
                            accessibilityLabel={isOnBreak ? "Finalizar descanso" : "Iniciar descanso"}
                            style={({ pressed }) => [
                                styles.actionButton,
                                { backgroundColor: buttonBg },
                                pressed && styles.actionButtonPressed,
                            ]}
                        >
                            <MaterialCommunityIcons
                                name="sleep"
                                size={20}
                                color={isOnBreak ? "#22C55E" : iconColor}
                            />
                        </Pressable>

                        <Pressable
                            onPress={reopenSession}
                            accessibilityLabel="Volver a abrir la sesión"
                            style={({ pressed }) => [
                                styles.actionButton,
                                { backgroundColor: buttonBg },
                                pressed && styles.actionButtonPressed,
                            ]}
                        >
                            <MaterialIcons
                                name="keyboard-arrow-up"
                                size={24}
                                color={iconColor}
                            />
                        </Pressable>
                    </View>
                </GlassView>
            </View>

            {!onStartBreak && (
                <BreakDurationDialog
                    visible={isBreakDialogVisible}
                    onClose={() => setIsBreakDialogVisible(false)}
                    onConfirm={startBreak}
                />
            )}
        </>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        left: Spacing.three,
        right: Spacing.three,
        zIndex: 50,
    },
    bar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 28,
    },
    barFallbackDark: {
        backgroundColor: "rgba(29, 29, 35, 0.92)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.20)",
    },
    barFallbackLight: {
        backgroundColor: "rgba(255, 255, 255, 0.94)",
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.10)",
    },
    metrics: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    metricBlock: {
        gap: 2,
    },
    divider: {
        width: 1,
        height: 28,
    },
    label: {
        fontSize: 11,
        fontWeight: "500",
    },
    value: {
        fontSize: 16,
        fontWeight: "600",
    },
    timerValue: {
        fontVariant: ["tabular-nums"],
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    actionButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
    },
    actionButtonPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.94 }],
    },
});