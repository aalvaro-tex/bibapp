import { useEffect, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";
import { router } from "expo-router";
import { GlassView } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useStudySession } from "@/context/study-session-context";
import { SessionSubjectCard } from "@/components/session-subject-card";
import { BreakDurationDialog } from "@/components/break-duration-dialog";

export default function SessionScreen() {
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const isDark = colorScheme === "dark";

    const [isBreakDialogVisible, setIsBreakDialogVisible] = useState(false);

    const openSubjectPicker = () => {
        router.push("/subject-picker-modal");
    };

    const {
        title,
        formattedElapsedTime,
        studiedTopicsCount,
        subjects,
        minimizeSession,
        setIsModalVisible,
        removeSubject,
        toggleTopicCompleted,
        completeSession,
        isOnBreak,
        breakSeconds,
        breakRemainingSeconds,
        formattedBreakRemainingTime,
        startBreak,
        cancelBreak,
    } = useStudySession();

    // Sincroniza la barra flotante si se cierra con gesto nativo o botón atrás
    useEffect(() => {
        setIsModalVisible(true);
        return () => setIsModalVisible(false);
    }, [setIsModalVisible]);

    const handleOpenAddTopic = (sessionSubjectId: string) => {
        router.push({
            pathname: "/topic-modal",
            params: { sessionSubjectId },
        });
    };

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

        setIsBreakDialogVisible(true);
    };

    const handleFinishSessionPress = () => {
        Alert.alert(
            "Terminar sesión",
            "¿Seguro que quieres finalizar la sesión actual?",
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Terminar",
                    style: "default",
                    onPress: () => {
                        completeSession();
                        router.replace("/session-summary");
                    },
                },
            ]
        );
    };

    const totalBreakDuration = Math.max(1, breakSeconds + breakRemainingSeconds);
    const breakProgressPercent = Math.max(
        0,
        Math.min(100, (breakRemainingSeconds / totalBreakDuration) * 100)
    );

    return (
        <View
            style={[
                styles.sessionModal,
                {
                    backgroundColor: isDark ? "#000000" : "#FFFFFF",
                    paddingTop: insets.top,
                },
            ]}
        >
            <View style={styles.sessionHeader}>
                <ThemedText type="subtitle">{title}</ThemedText>

                <View style={styles.headerActions}>
                    <Pressable
                        onPress={handleFinishSessionPress}
                        accessibilityLabel="Terminar sesión"
                    >
                        <GlassView
                            style={styles.finishSessionButton}
                            glassEffectStyle="regular"
                            isInteractive
                        >
                            <MaterialIcons
                                name="check"
                                size={22}
                                color={isDark ? "#FFFFFF" : "#000000"}
                            />
                        </GlassView>
                    </Pressable>

                    <Pressable
                        onPress={handleBreakPress}
                        accessibilityLabel={isOnBreak ? "Finalizar descanso" : "Iniciar descanso"}
                    >
                        <GlassView
                            style={styles.nativeGlassButton}
                            glassEffectStyle="regular"
                            isInteractive
                        >
                            <MaterialCommunityIcons
                                name="sleep"
                                size={22}
                                color={isOnBreak ? "#22C55E" : isDark ? "#FFFFFF" : "#000000"}
                            />
                        </GlassView>
                    </Pressable>

                    <Pressable
                        onPress={minimizeSession}
                        accessibilityLabel="Minimizar sesión"
                    >
                        <GlassView
                            style={styles.nativeGlassButton}
                            glassEffectStyle="regular"
                            isInteractive
                        >
                            <MaterialIcons
                                name="keyboard-arrow-down"
                                size={24}
                                color={isDark ? "#FFFFFF" : "#000000"}
                            />
                        </GlassView>
                    </Pressable>
                </View>
            </View>

            {isOnBreak && breakRemainingSeconds > 0 && (
                <View style={styles.breakBarWrapper}>
                    <View style={styles.breakBarTopRow}>
                        <Text style={styles.breakBarText}>
                            Descanso · {formattedBreakRemainingTime}
                        </Text>
                        <Pressable onPress={handleBreakPress} hitSlop={8}>
                            <Text style={styles.breakCancelLink}>Finalizar descanso</Text>
                        </Pressable>
                    </View>
                    <View
                        style={[
                            styles.breakTrack,
                            { backgroundColor: isDark ? "#14532D" : "#DCFCE7" },
                        ]}
                    >
                        <View
                            style={[
                                styles.breakProgressFill,
                                { width: `${breakProgressPercent}%` },
                            ]}
                        />
                    </View>
                </View>
            )}

            <View
                style={[
                    styles.sessionInfo,
                    { borderBottomColor: isDark ? "#27272A" : "#E4E4E7" },
                ]}
            >
                <View style={styles.infoBlock}>
                    <ThemedText type="small" themeColor="textSecondary">
                        Tiempo
                    </ThemedText>
                    <Text
                        style={[
                            styles.infoValue,
                            styles.timerValue,
                            { color: isDark ? "#FFFFFF" : "#000000" },
                        ]}
                    >
                        {formattedElapsedTime}
                    </Text>
                </View>

                <View style={[styles.infoBlock, styles.infoBlockRight]}>
                    <ThemedText type="small" themeColor="textSecondary">
                        Temas estudiados
                    </ThemedText>
                    <Text
                        style={[
                            styles.infoValue,
                            { color: isDark ? "#FFFFFF" : "#000000" },
                        ]}
                    >
                        {studiedTopicsCount}
                    </Text>
                </View>
            </View>

            <View style={styles.sessionContent}>
                {subjects.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialIcons
                            name="menu-book"
                            size={68}
                            color={isDark ? "#52525B" : "#A1A1AA"}
                        />

                        <ThemedText
                            style={styles.sessionHint}
                            themeColor="textSecondary"
                        >
                            Añade una asignatura para empezar a estudiar
                        </ThemedText>

                        <Pressable
                            onPress={openSubjectPicker}
                            style={styles.addSubjectPressable}
                            accessibilityLabel="Añadir asignatura"
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
                                    style={[
                                        styles.addSubjectButton,
                                        pressed && styles.addSubjectButtonPressed,
                                    ]}
                                >
                                    <MaterialIcons name="add" size={20} color="#FFFFFF" />
                                    <Text style={styles.addSubjectText}>
                                        Añadir asignatura
                                    </Text>
                                </LinearGradient>
                            )}
                        </Pressable>
                    </View>
                ) : (
                    <ScrollView
                        style={styles.subjectsList}
                        contentContainerStyle={styles.subjectsListContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {subjects.map(subject => (
                            <SessionSubjectCard
                                key={subject.id}
                                subject={subject}
                                onAddTopic={handleOpenAddTopic}
                                onToggleTopic={toggleTopicCompleted}
                                onRemoveSubject={removeSubject}
                            />
                        ))}

                        <Pressable
                            onPress={openSubjectPicker}
                            style={styles.addSubjectPressable}
                            accessibilityLabel="Añadir asignatura"
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
                                    style={[
                                        styles.addSubjectButton,
                                        pressed && styles.addSubjectButtonPressed,
                                    ]}
                                >
                                    <MaterialIcons name="add" size={20} color="#FFFFFF" />
                                    <Text style={styles.addSubjectText}>
                                        Añadir asignatura
                                    </Text>
                                </LinearGradient>
                            )}
                        </Pressable>
                    </ScrollView>
                )}
            </View>

            <BreakDurationDialog
                visible={isBreakDialogVisible}
                onClose={() => setIsBreakDialogVisible(false)}
                onConfirm={startBreak}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    sessionModal: {
        flex: 1,
    },
    sessionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: Spacing.three,
        paddingHorizontal: Spacing.three,
    },
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    nativeGlassButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    sessionInfo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: Spacing.three,
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: Spacing.three,
    },
    infoBlock: {
        gap: 2,
    },
    infoBlockRight: {
        alignItems: "flex-end",
    },
    infoValue: {
        fontSize: 20,
        fontWeight: "600",
    },
    timerValue: {
        fontVariant: ["tabular-nums"],
    },
    sessionContent: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        paddingBottom: Spacing.six,
    },
    sessionHint: {
        marginTop: Spacing.three,
        maxWidth: 320,
        textAlign: "center",
        marginBottom: Spacing.two,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.four,
    },
    addSubjectPressable: {
        marginTop: Spacing.two,
    },
    addSubjectButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 50,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    addSubjectButtonPressed: {
        opacity: 0.85,
    },
    addSubjectText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    subjectsList: {
        flex: 1,
        width: "100%",
    },
    subjectsListContent: {
        paddingTop: Spacing.three,
        paddingHorizontal: Spacing.three,
        paddingBottom: Spacing.six,
        gap: 12,
    },
    finishSessionButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgb(21, 255, 0)",
    },
    breakBarWrapper: {
        paddingHorizontal: Spacing.three,
        paddingBottom: Spacing.two,
        gap: 6,
    },
    breakBarTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    breakBarText: {
        color: "#22C55E",
        fontSize: 12,
        fontWeight: "600",
        fontVariant: ["tabular-nums"],
    },
    breakCancelLink: {
        color: "#22C55E",
        fontSize: 12,
        fontWeight: "600",
        textDecorationLine: "underline",
    },
    breakTrack: {
        width: "100%",
        height: 6,
        borderRadius: 999,
        overflow: "hidden",
    },
    breakProgressFill: {
        height: "100%",
        backgroundColor: "#22C55E",
        borderRadius: 999,
    },
});