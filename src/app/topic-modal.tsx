import { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useColorScheme,
    View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { Spacing } from "@/constants/theme";
import { TopicType, useStudySession } from "@/context/study-session-context";

const TOPIC_TYPES: { code: TopicType; label: string }[] = [
    { code: "P", label: "Práctica" },
    { code: "E", label: "Estudio" },
    { code: "R", label: "Repaso" },
    { code: "A", label: "Hacer apuntes" },
];

export default function TopicModalScreen() {
    const { sessionSubjectId } = useLocalSearchParams<{
        sessionSubjectId?: string;
    }>();
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const { subjects, addTopic } = useStudySession();

    const [name, setName] = useState("");
    const [selectedType, setSelectedType] = useState<TopicType>("E");

    const isDark = colorScheme === "dark";
    const textColor = isDark ? "#FFFFFF" : "#000000";
    const secondaryColor = isDark ? "#A1A1AA" : "#71717A";
    const surfaceColor = isDark ? "#18181B" : "#FFFFFF";
    const cardColor = isDark ? "#27272A" : "#F4F4F5";
    const borderColor = isDark ? "#3F3F46" : "#E4E4E7";

    const targetSubject = subjects.find(s => s.id === sessionSubjectId);
    const accentColor = targetSubject?.color ?? "#5a835f";
    const canSave = name.trim().length > 0 && Boolean(sessionSubjectId);

    const handleSaveTopic = () => {
        if (!canSave || !sessionSubjectId) return;
        addTopic(sessionSubjectId, name, selectedType);
        router.back();
    };

    return (
        <View style={[styles.container, { backgroundColor: surfaceColor }]}>
            <View style={styles.grabberWrapper}>
                <View
                    style={[
                        styles.grabber,
                        { backgroundColor: isDark ? "#52525B" : "#D4D4D8" },
                    ]}
                />
            </View>

            <View style={[styles.header, { borderBottomColor: borderColor }]}>
                <View style={styles.headerTitleGroup}>
                    <Text style={[styles.headerTitle, { color: textColor }]}>
                        Nuevo tema
                    </Text>
                    {targetSubject && (
                        <Text
                            style={[styles.headerSubtitle, { color: secondaryColor }]}
                            numberOfLines={1}
                        >
                            {targetSubject.name}
                        </Text>
                    )}
                </View>

                <Pressable
                    onPress={() => router.back()}
                    style={styles.iconButton}
                    accessibilityLabel="Cerrar modal de tema"
                >
                    <MaterialIcons name="close" size={22} color={textColor} />
                </Pressable>
            </View>

            <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={[
                    styles.formContainer,
                    { paddingBottom: Math.max(insets.bottom, 24) },
                ]}
                contentInsetAdjustmentBehavior="never"
                automaticallyAdjustKeyboardInsets
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.fieldGroup}>
                    <Text style={[styles.fieldLabel, { color: secondaryColor }]}>
                        Nombre del tema
                    </Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Ej. Espacios vectoriales, Tema 1..."
                        placeholderTextColor={secondaryColor}
                        autoFocus
                        returnKeyType="done"
                        onSubmitEditing={handleSaveTopic}
                        style={[
                            styles.input,
                            {
                                backgroundColor: cardColor,
                                color: textColor,
                                borderColor,
                            },
                        ]}
                    />
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={[styles.fieldLabel, { color: secondaryColor }]}>
                        Tipo
                    </Text>
                    <View style={styles.typesGrid}>
                        {TOPIC_TYPES.map(item => {
                            const isSelected = selectedType === item.code;
                            return (
                                <Pressable
                                    key={item.code}
                                    onPress={() => setSelectedType(item.code)}
                                    style={[
                                        styles.typeOption,
                                        {
                                            backgroundColor: cardColor,
                                            borderColor: isSelected
                                                ? accentColor
                                                : borderColor,
                                        },
                                        isSelected && { borderWidth: 2 },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.typeBadge,
                                            {
                                                backgroundColor: isSelected
                                                    ? accentColor
                                                    : isDark
                                                        ? "#3F3F46"
                                                        : "#E4E4E7",
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.typeBadgeText,
                                                {
                                                    color: isSelected
                                                        ? "#FFFFFF"
                                                        : textColor,
                                                },
                                            ]}
                                        >
                                            {item.code}
                                        </Text>
                                    </View>

                                    <Text
                                        style={[
                                            styles.typeLabel,
                                            { color: textColor },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {item.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <Pressable
                    disabled={!canSave}
                    onPress={handleSaveTopic}
                    style={[styles.primaryPressable, !canSave && { opacity: 0.45 }]}
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
                            style={styles.primaryButton}
                        >
                            <Text style={styles.primaryButtonText}>
                                Guardar tema
                            </Text>
                        </LinearGradient>
                    )}
                </Pressable>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    grabberWrapper: {
        alignItems: "center",
        paddingTop: 10,
        paddingBottom: 4,
    },
    grabber: {
        width: 38,
        height: 5,
        borderRadius: 3,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.three,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerTitleGroup: {
        flex: 1,
        gap: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
    headerSubtitle: {
        fontSize: 13,
    },
    iconButton: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
    },
    scrollArea: {
        flex: 1,
    },
    formContainer: {
        padding: Spacing.four,
        gap: 20,
    },
    fieldGroup: {
        gap: 8,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: "600",
    },
    input: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 14,
        fontSize: 16,
    },
    typesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    typeOption: {
        width: "48.5%",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    typeBadge: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    typeBadgeText: {
        fontSize: 13,
        fontWeight: "700",
    },
    typeLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
    },
    primaryPressable: {
        width: "100%",
        marginTop: 4,
    },
    primaryButton: {
        alignItems: "center",
        justifyContent: "center",
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 20,
    },
    primaryButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});