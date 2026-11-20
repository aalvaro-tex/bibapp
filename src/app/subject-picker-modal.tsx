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
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { LocalSubject, useLocalSubjects } from "@/context/subjects-context";
import { useStudySession } from "@/context/study-session-context";

const SUBJECT_COLORS = [
    "#5a835f",
    "#16A34A",
    "#0891B2",
    "#2563EB",
    "#7C3AED",
    "#DB2777",
    "#DC2626",
    "#EA580C",
    "#CA8A04",
    "#64748B",
];

export default function SubjectPickerScreen() {
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const { subjects: localSubjects, createSubject } = useLocalSubjects();
    const { subjects: sessionSubjects, addSubject } = useStudySession();

    const [mode, setMode] = useState<"list" | "create">("list");
    const [name, setName] = useState("");
    const [selectedColor, setSelectedColor] = useState(SUBJECT_COLORS[0]);
    const [isSaving, setIsSaving] = useState(false);

    const isDark = colorScheme === "dark";
    const textColor = isDark ? "#FFFFFF" : "#000000";
    const secondaryColor = isDark ? "#A1A1AA" : "#71717A";
    const surfaceColor = isDark ? "#18181B" : "#FFFFFF";
    const cardColor = isDark ? "#27272A" : "#F4F4F5";
    const borderColor = isDark ? "#3F3F46" : "#E4E4E7";

    const addedSubjectIds = sessionSubjects.map(item => item.subjectId);
    const canSave = name.trim().length > 0 && !isSaving;

    const handleSelectSubject = (subject: LocalSubject) => {
        addSubject(subject);
        router.back();
    };

    const handleCreateSubject = async () => {
        if (!canSave) return;
        setIsSaving(true);
        try {
            const created = await createSubject(name, selectedColor);
            addSubject(created);
            router.back();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: surfaceColor }]}>
            {/* Tirador superior discreto */}
            <View style={styles.grabberWrapper}>
                <View
                    style={[
                        styles.grabber,
                        { backgroundColor: isDark ? "#52525B" : "#D4D4D8" },
                    ]}
                />
            </View>

            {/* Cabecera fija que nunca se solapa con el contenido */}
            <View
                style={[
                    styles.header,
                    {
                        backgroundColor: surfaceColor,
                        borderBottomColor: borderColor,
                    },
                ]}
            >
                <View style={styles.headerLeft}>
                    {mode === "create" && (
                        <Pressable
                            onPress={() => setMode("list")}
                            style={styles.iconButton}
                            accessibilityLabel="Volver a la lista"
                        >
                            <MaterialIcons name="arrow-back" size={22} color={textColor} />
                        </Pressable>
                    )}
                    <Text style={[styles.headerTitle, { color: textColor }]}>
                        {mode === "list" ? "Elegir asignatura" : "Nueva asignatura"}
                    </Text>
                </View>

                <Pressable
                    onPress={() => router.back()}
                    style={styles.iconButton}
                    accessibilityLabel="Cerrar selector"
                >
                    <MaterialIcons name="close" size={22} color={textColor} />
                </Pressable>
            </View>

            {/* Cuerpo contenido y recortado debajo de la cabecera */}
            <View style={styles.body}>
                {mode === "list" ? (
                    localSubjects.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialIcons
                                name="library-books"
                                size={48}
                                color={secondaryColor}
                            />
                            <ThemedText
                                style={styles.emptyText}
                                themeColor="textSecondary"
                            >
                                Todavía no tienes ninguna asignatura guardada.
                            </ThemedText>

                            <Pressable
                                onPress={() => setMode("create")}
                                style={styles.primaryPressable}
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
                                        <MaterialIcons name="add" size={20} color="#FFFFFF" />
                                        <Text style={styles.primaryButtonText}>
                                            Crear nueva asignatura
                                        </Text>
                                    </LinearGradient>
                                )}
                            </Pressable>
                        </View>
                    ) : (
                        <View
                            style={[
                                styles.listContainer,
                                { paddingBottom: Math.max(insets.bottom, 16) },
                            ]}
                        >
                            <ScrollView
                                style={styles.scrollArea}
                                contentContainerStyle={styles.scrollContent}
                                contentInsetAdjustmentBehavior="never"
                                showsVerticalScrollIndicator={false}
                            >
                                {localSubjects.map(subject => {
                                    const isAdded = addedSubjectIds.includes(subject.id);
                                    return (
                                        <Pressable
                                            key={subject.id}
                                            disabled={isAdded}
                                            onPress={() => handleSelectSubject(subject)}
                                            style={({ pressed }) => [
                                                styles.subjectRow,
                                                {
                                                    backgroundColor: cardColor,
                                                    opacity: isAdded ? 0.5 : pressed ? 0.8 : 1,
                                                },
                                            ]}
                                        >
                                            <View style={styles.subjectRowLeft}>
                                                <View
                                                    style={[
                                                        styles.colorDot,
                                                        { backgroundColor: subject.color },
                                                    ]}
                                                />
                                                <Text
                                                    style={[
                                                        styles.subjectName,
                                                        { color: textColor },
                                                    ]}
                                                >
                                                    {subject.name}
                                                </Text>
                                            </View>

                                            <MaterialIcons
                                                name={isAdded ? "check" : "add"}
                                                size={20}
                                                color={isAdded ? "#16A34A" : secondaryColor}
                                            />
                                        </Pressable>
                                    );
                                })}
                            </ScrollView>

                            <Pressable
                                onPress={() => setMode("create")}
                                style={[styles.secondaryButton, { borderColor }]}
                            >
                                <MaterialIcons name="add" size={18} color={textColor} />
                                <Text
                                    style={[
                                        styles.secondaryButtonText,
                                        { color: textColor },
                                    ]}
                                >
                                    Crear nueva asignatura
                                </Text>
                            </Pressable>
                        </View>
                    )
                ) : (
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
                                Nombre
                            </Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                placeholder="Ej. Álgebra, Derecho Penal..."
                                placeholderTextColor={secondaryColor}
                                autoFocus
                                returnKeyType="done"
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
                                Color
                            </Text>
                            <View style={styles.colorGrid}>
                                {SUBJECT_COLORS.map(color => {
                                    const isSelected = selectedColor === color;
                                    return (
                                        <Pressable
                                            key={color}
                                            onPress={() => setSelectedColor(color)}
                                            accessibilityLabel={`Seleccionar color ${color}`}
                                            style={[
                                                styles.colorSwatch,
                                                { backgroundColor: color },
                                                isSelected && {
                                                    borderColor: textColor,
                                                    borderWidth: 2.5,
                                                },
                                            ]}
                                        >
                                            {isSelected && (
                                                <MaterialIcons
                                                    name="check"
                                                    size={18}
                                                    color="#FFFFFF"
                                                />
                                            )}
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        <Pressable
                            disabled={!canSave}
                            onPress={handleCreateSubject}
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
                                        Guardar y añadir
                                    </Text>
                                </LinearGradient>
                            )}
                        </Pressable>
                    </ScrollView>
                )}
            </View>
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
        zIndex: 10,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
    iconButton: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
    },
    body: {
        flex: 1,
        overflow: "hidden",
    },
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.four,
        gap: 12,
    },
    emptyText: {
        textAlign: "center",
        maxWidth: 260,
        marginBottom: 8,
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: Spacing.four,
        paddingTop: Spacing.three,
        gap: 12,
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        gap: 8,
        paddingBottom: 8,
    },
    subjectRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderRadius: 12,
    },
    subjectRowLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    colorDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
    },
    subjectName: {
        fontSize: 16,
        fontWeight: "500",
    },
    secondaryButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        height: 46,
        borderRadius: 12,
        borderWidth: 1,
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: "600",
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
    colorGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    colorSwatch: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryPressable: {
        width: "100%",
    },
    primaryButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
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