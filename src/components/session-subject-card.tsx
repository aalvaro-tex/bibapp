import { Alert, Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { SessionSubject } from "@/context/study-session-context";

type SessionSubjectCardProps = {
    subject: SessionSubject;
    onAddTopic: (sessionSubjectId: string) => void;
    onToggleTopic?: (sessionSubjectId: string, topicId: string) => void;
    onRemoveSubject?: (sessionSubjectId: string) => void;
};

export function SessionSubjectCard({
    subject,
    onAddTopic,
    onRemoveSubject,
    onToggleTopic,
}: SessionSubjectCardProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const cardBg = isDark ? "#18181B" : "#F4F4F5";
    const borderColor = isDark ? "#27272A" : "#E4E4E7";
    const textColor = isDark ? "#FFFFFF" : "#000000";
    const secondaryColor = isDark ? "#A1A1AA" : "#71717A";
    const buttonBg = isDark ? "#27272A" : "#E4E4E7";

    const deleteBg = isDark
        ? "rgba(220, 38, 38, 0.16)"
        : "rgba(220, 38, 38, 0.12)";
    const deleteColor = isDark ? "#F87171" : "#DC2626";

    const handleDeletePress = () => {
        if (!onRemoveSubject) return;

        Alert.alert(
            "Eliminar asignatura",
            `¿Seguro que quieres eliminar "${subject.name}" y sus temas de esta sesión?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => onRemoveSubject(subject.id),
                },
            ]
        );
    };

    return (
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            {/* Solo la cabecera con el nombre de la asignatura tiene el degradado */}
            <LinearGradient
                colors={["#1d1d23", subject.color]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
            >
                <Text style={styles.subjectName} numberOfLines={1}>
                    {subject.name}
                </Text>
            </LinearGradient>

            {/* Cuerpo de la tarjeta con los temas y el botón Añadir tema */}
            <View style={styles.body}>
                {subject.topics.length === 0 ? (
                    <View style={[styles.emptyTopics, { borderColor }]}>
                        <Text
                            style={[styles.emptyTopicsText, { color: secondaryColor }]}
                        >
                            Sin temas añadidos
                        </Text>
                    </View>
                ) : (
                    <View style={styles.topicsList}>
                        {subject.topics.map((topic, index) => {
                            const isLast = index === subject.topics.length - 1;


                            return (
                                <View
                                    key={topic.id}
                                    style={[
                                        styles.topicRow,
                                        !isLast && {
                                            borderBottomWidth: StyleSheet.hairlineWidth,
                                            borderBottomColor: borderColor,
                                        },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.typePill,
                                            { backgroundColor: subject.color },
                                        ]}
                                    >
                                        <Text style={styles.typePillText}>
                                            {topic.type}
                                        </Text>
                                    </View>

                                    <Text
                                        style={[
                                            styles.topicName,
                                            { color: textColor },
                                            topic.completed && styles.topicCompleted,
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {topic.name}
                                    </Text>

                                    <Text
                                        style={[
                                            styles.topicPercent,
                                            {
                                                color: topic.completed
                                                    ? subject.color
                                                    : secondaryColor,
                                            },
                                        ]}
                                    >
                                        Completado
                                    </Text>

                                    <Pressable
                                        onPress={() =>
                                            onToggleTopic?.(subject.id, topic.id)
                                        }
                                        hitSlop={8}
                                        accessibilityLabel={`Marcar ${topic.name} como completado`}
                                        style={({ pressed }) => [
                                            styles.checkButton,
                                            pressed && { opacity: 0.7 },
                                        ]}
                                    >
                                        <MaterialIcons
                                            name={
                                                topic.completed
                                                    ? "check-box"
                                                    : "check-box-outline-blank"
                                            }
                                            size={22}
                                            color={
                                                topic.completed
                                                    ? subject.color
                                                    : secondaryColor
                                            }
                                        />
                                    </Pressable>
                                </View>
                            );
                        })}
                    </View>
                )}

                <View style={styles.actionsRow}>
                    <Pressable
                        onPress={() => onAddTopic(subject.id)}
                        accessibilityLabel={`Añadir tema a ${subject.name}`}
                        style={({ pressed }) => [
                            styles.addTopicButton,
                            { backgroundColor: buttonBg },
                            pressed && { opacity: 0.75 },
                        ]}
                    >
                        <MaterialIcons name="add" size={18} color={textColor} />
                        <Text style={[styles.addTopicText, { color: textColor }]}>
                            Añadir tema
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={handleDeletePress}
                        accessibilityLabel={`Eliminar ${subject.name} de la sesión`}
                        style={({ pressed }) => [
                            styles.deleteSubjectButton,
                            { backgroundColor: deleteBg },
                            pressed && { opacity: 0.75 },
                        ]}
                    >
                        <MaterialIcons
                            name="delete-outline"
                            size={20}
                            color={deleteColor}
                        />
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "100%",
        borderRadius: 14,
        overflow: "hidden",
        borderWidth: StyleSheet.hairlineWidth,
    },
    header: {
        width: "100%",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    subjectName: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    body: {
        padding: 12,
        gap: 10,
    },
    emptyTopics: {
        minHeight: 44,
        borderRadius: 10,
        borderWidth: 1,
        borderStyle: "dashed",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
    },
    emptyTopicsText: {
        fontSize: 13,
    },
    topicsList: {
        borderRadius: 10,
        overflow: "hidden",
    },
    topicRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 4,
    },
    typePill: {
        width: 24,
        height: 24,
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
    },
    typePillText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "700",
    },
    topicName: {
        flex: 1,
        fontSize: 15,
        fontWeight: "500",
    },
    topicCompleted: {
        opacity: 0.6,
        textDecorationLine: "line-through",
    },
    topicPercent: {
        fontSize: 13,
        fontWeight: "600",
        fontVariant: ["tabular-nums"],
    },
    checkButton: {
        alignItems: "center",
        justifyContent: "center",
    },
    addTopicText: {
        fontSize: 14,
        fontWeight: "600",
    },
    actionsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    addTopicButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        height: 40,
        borderRadius: 10,
    },
    deleteSubjectButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
});