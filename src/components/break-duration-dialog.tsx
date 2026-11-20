import { useEffect, useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    useColorScheme,
    View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";

type BreakDurationDialogProps = {
    visible: boolean;
    onClose: () => void;
    onConfirm: (durationMinutes: number) => void;
};

const PRESET_MINUTES = [5, 10, 15, 25];

export function BreakDurationDialog({
    visible,
    onClose,
    onConfirm,
}: BreakDurationDialogProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const [selectedMinutes, setSelectedMinutes] = useState(5);
    const [customMinutes, setCustomMinutes] = useState("5");

    useEffect(() => {
        if (visible) {
            setSelectedMinutes(5);
            setCustomMinutes("5");
        }
    }, [visible]);

    const handleSelectPreset = (minutes: number) => {
        setSelectedMinutes(minutes);
        setCustomMinutes(String(minutes));
    };

    const handleChangeText = (value: string) => {
        const digitsOnly = value.replace(/[^0-9]/g, "");
        setCustomMinutes(digitsOnly);
        const parsed = parseInt(digitsOnly, 10);
        if (!Number.isNaN(parsed) && parsed > 0) {
            setSelectedMinutes(parsed);
        }
    };

    const handleAccept = () => {
        const parsed = parseInt(customMinutes, 10);
        const finalMinutes =
            !Number.isNaN(parsed) && parsed > 0 ? parsed : selectedMinutes;
        if (finalMinutes > 0) {
            onConfirm(finalMinutes);
            onClose();
        }
    };

    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.backdrop}>
                <View
                    style={[
                        styles.dialogCard,
                        {
                            backgroundColor: isDark ? "#18181B" : "#FFFFFF",
                            borderColor: isDark ? "#27272A" : "#E4E4E7",
                        },
                    ]}
                >
                    <View style={styles.header}>
                        <MaterialCommunityIcons
                            name="sleep"
                            size={24}
                            color="#22C55E"
                        />
                        <ThemedText type="subtitle">Tiempo de descanso</ThemedText>
                    </View>

                    <ThemedText
                        type="small"
                        themeColor="textSecondary"
                        style={styles.description}
                    >
                        Selecciona la duración del descanso en minutos.
                    </ThemedText>

                    <View style={styles.presetsRow}>
                        {PRESET_MINUTES.map(minutes => {
                            const isSelected =
                                selectedMinutes === minutes &&
                                customMinutes === String(minutes);
                            return (
                                <Pressable
                                    key={minutes}
                                    onPress={() => handleSelectPreset(minutes)}
                                    style={[
                                        styles.presetChip,
                                        {
                                            backgroundColor: isSelected
                                                ? "#22C55E"
                                                : isDark
                                                    ? "#27272A"
                                                    : "#F4F4F5",
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.presetText,
                                            {
                                                color: isSelected
                                                    ? "#FFFFFF"
                                                    : isDark
                                                        ? "#FFFFFF"
                                                        : "#000000",
                                            },
                                        ]}
                                    >
                                        {minutes} min
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    <View style={styles.customRow}>
                        <Text
                            style={[
                                styles.customLabel,
                                { color: isDark ? "#A1A1AA" : "#71717A" },
                            ]}
                        >
                            Minutos personalizados:
                        </Text>
                        <TextInput
                            value={customMinutes}
                            onChangeText={handleChangeText}
                            keyboardType="number-pad"
                            maxLength={3}
                            style={[
                                styles.input,
                                {
                                    color: isDark ? "#FFFFFF" : "#000000",
                                    backgroundColor: isDark ? "#27272A" : "#F4F4F5",
                                    borderColor: isDark ? "#3F3F46" : "#D4D4D8",
                                },
                            ]}
                        />
                    </View>

                    <View style={styles.actionsRow}>
                        <Pressable
                            onPress={onClose}
                            style={[
                                styles.button,
                                {
                                    backgroundColor: isDark ? "#27272A" : "#F4F4F5",
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.cancelText,
                                    { color: isDark ? "#FFFFFF" : "#000000" },
                                ]}
                            >
                                Cancelar
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={handleAccept}
                            style={[styles.button, styles.acceptButton]}
                        >
                            <Text style={styles.acceptText}>Aceptar</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.four,
    },
    dialogCard: {
        width: "100%",
        borderRadius: 20,
        borderWidth: 1,
        padding: Spacing.four,
        gap: 14,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    description: {
        lineHeight: 18,
    },
    presetsRow: {
        flexDirection: "row",
        gap: 8,
    },
    presetChip: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
    },
    presetText: {
        fontSize: 13,
        fontWeight: "600",
        fontVariant: ["tabular-nums"],
    },
    customRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    customLabel: {
        fontSize: 14,
        fontWeight: "500",
    },
    input: {
        width: 84,
        height: 40,
        borderRadius: 10,
        borderWidth: 1,
        textAlign: "center",
        fontSize: 16,
        fontWeight: "600",
        fontVariant: ["tabular-nums"],
    },
    actionsRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 4,
    },
    button: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelText: {
        fontSize: 15,
        fontWeight: "600",
    },
    acceptButton: {
        backgroundColor: "#22C55E",
    },
    acceptText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },
});