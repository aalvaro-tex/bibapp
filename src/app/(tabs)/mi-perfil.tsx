import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import {
    SessionSummary,
    useStudySession,
} from "@/context/study-session-context";
import { GlassView } from "expo-glass-effect";

import { useUserSettings } from "@/context/user-settings-context";

const formatSessionDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default function ProfileTabScreen() {
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const { completedSessions } = useStudySession();

    const isDark = colorScheme === "dark";
    const textColor = isDark ? "#FFFFFF" : "#000000";
    const secondaryColor = isDark ? "#A1A1AA" : "#71717A";
    const cardBg = isDark ? "#18181B" : "#F4F4F5";
    const borderColor = isDark ? "#27272A" : "#E4E4E7";
    const buttonBg = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.05)";

    const handleOpenSettings = () => {
        // Cambia la ruta por la que corresponda a tu pantalla de ajustes, p. ej. "/settings"
        router.push("/settings");
    };

    const { username } = useUserSettings();
    const displayName = username?.trim() || "Estudiante";

    const renderSessionItem = ({ item }: { item: SessionSummary }) => (
        <View
            style={[
                styles.sessionCard,
                { backgroundColor: cardBg, borderColor },
            ]}
        >
            <View style={styles.cardHeader}>
                <View style={styles.titleRow}>
                    <Text style={[styles.sessionBadge, { color: "#5a835f" }]}>
                        #{item.sessionNumber}
                    </Text>
                    <Text
                        style={[styles.sessionTitle, { color: textColor }]}
                        numberOfLines={1}
                    >
                        {item.title}
                    </Text>
                </View>
                <Text style={[styles.dateText, { color: secondaryColor }]}>
                    {formatSessionDate(item.completedAt)}
                </Text>
            </View>

            {item.subjects.length > 0 && (
                <View style={styles.subjectsRow}>
                    {item.subjects.map((subject) => (
                        <View
                            key={subject.id}
                            style={[
                                styles.subjectChip,
                                { borderColor: subject.color },
                            ]}
                        >
                            <View
                                style={[
                                    styles.subjectDot,
                                    { backgroundColor: subject.color },
                                ]}
                            />
                            <Text
                                style={[
                                    styles.subjectChipText,
                                    { color: textColor },
                                ]}
                            >
                                {subject.name}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            <View style={[styles.metricsRow, { borderTopColor: borderColor }]}>
                <View style={styles.metric}>
                    <MaterialIcons
                        name="schedule"
                        size={15}
                        color={secondaryColor}
                    />
                    <Text
                        style={[
                            styles.metricValue,
                            styles.tabular,
                            { color: textColor },
                        ]}
                    >
                        {item.formattedElapsedTime}
                    </Text>
                </View>

                <View style={styles.metric}>
                    <MaterialIcons
                        name="free-breakfast"
                        size={15}
                        color={secondaryColor}
                    />
                    <Text
                        style={[
                            styles.metricValue,
                            styles.tabular,
                            { color: secondaryColor },
                        ]}
                    >
                        {item.formattedBreakTime}
                    </Text>
                </View>

                <View style={styles.metric}>
                    <MaterialIcons
                        name="check-circle-outline"
                        size={15}
                        color={secondaryColor}
                    />
                    <Text
                        style={[
                            styles.metricValue,
                            styles.tabular,
                            { color: textColor },
                        ]}
                    >
                        {item.completedTopicsCount}/{item.totalTopicsCount} temas
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: isDark ? "#000000" : "#FFFFFF",
                    paddingTop: insets.top + Spacing.three,
                },
            ]}
        >
            <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    <ThemedText type="title" numberOfLines={1} style={styles.usernameTitle}>
                        {displayName}
                    </ThemedText>

                    <Pressable
                        onPress={handleOpenSettings}
                        accessibilityLabel="Minimizar sesión"
                    >
                        <GlassView
                            style={styles.nativeGlassButton}
                            glassEffectStyle="regular"
                            isInteractive
                        >
                            <MaterialCommunityIcons
                                name="cog-outline"
                                size={24}
                                color={isDark ? "#FFFFFF" : "#000000"}
                            />
                        </GlassView>
                    </Pressable>
                </View>

                <ThemedText type="small" themeColor="textSecondary">
                    Sesiones realizadas ({completedSessions.length})
                </ThemedText>
            </View>

            <FlatList
                data={completedSessions}
                keyExtractor={(item) => item.id}
                renderItem={renderSessionItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <MaterialIcons
                            name="history"
                            size={48}
                            color={secondaryColor}
                        />
                        <Text
                            style={[styles.emptyText, { color: secondaryColor }]}
                        >
                            Aún no has completado ninguna sesión de estudio.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: Spacing.four,
        paddingBottom: Spacing.three,
        gap: 4,
    },
    headerTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: StyleSheet.hairlineWidth,
        alignItems: "center",
        justifyContent: "center",
    },
    settingsButtonPressed: {
        opacity: 0.75,
        transform: [{ scale: 0.94 }],
    },
    listContent: {
        paddingHorizontal: Spacing.four,
        paddingBottom: Spacing.six,
        gap: 12,
        flexGrow: 1,
    },
    sessionCard: {
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        padding: 14,
        gap: 10,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        flex: 1,
    },
    sessionBadge: {
        fontSize: 14,
        fontWeight: "700",
    },
    sessionTitle: {
        fontSize: 16,
        fontWeight: "600",
        flexShrink: 1,
    },
    dateText: {
        fontSize: 12,
    },
    subjectsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
    },
    subjectChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        borderWidth: StyleSheet.hairlineWidth,
    },
    subjectDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    subjectChipText: {
        fontSize: 12,
        fontWeight: "500",
    },
    metricsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    metric: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    metricValue: {
        fontSize: 13,
        fontWeight: "600",
    },
    tabular: {
        fontVariant: ["tabular-nums"],
    },
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: Spacing.six,
        gap: 10,
    },
    emptyText: {
        fontSize: 14,
        textAlign: "center",
        maxWidth: 260,
    },
    nativeGlassButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    usernameTitle: {
        flex: 1,
        marginRight: 8,
    },
});