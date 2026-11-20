import { useState } from "react";
import { Pressable, StyleSheet, Text, useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { Collapsible, Column, Host, Icon, ListItem, Row, Text as ExpoText } from "@expo/ui";
import { background, padding, shapes } from "@expo/ui/swift-ui/modifiers";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useStudySession } from "@/context/study-session-context";

type Section = "a" | "b" | "c" | null;

const STAR = Icon.select({
    ios: "star.fill",
    android: require("@expo/material-symbols/star.xml"),
});

const BOOK = Icon.select({
    ios: "book.fill",
    android: require("@expo/material-symbols/book.xml"),
});

export default function ButtonBorderShapeExample() {
    const colorScheme = useColorScheme();
    const [openSection, setOpenSection] = useState<Section>("a");
    const { startSession } = useStudySession();

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Nueva sesión de estudio</ThemedText>
            </ThemedView>

            <Pressable onPress={() => startSession("Sesión libre")}>
                {({ pressed }) => (
                    <LinearGradient
                        colors={
                            pressed
                                ? ["#151519", "#3f5e43"]
                                : ["#1d1d23", "#5a835f"]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.button, pressed && styles.buttonPressed]}
                    >
                        <MaterialIcons
                            name="add"
                            size={16}
                            color="#5a835f"
                            style={{ paddingRight: 8 }}
                        />
                        <Text style={styles.text}>Empezar sesión libre</Text>
                    </LinearGradient>
                )}
            </Pressable>

            <Pressable onPress={() => { /* Aquí irá la navegación/modal para crear rutina */ }}>
                {({ pressed }) => (
                    <LinearGradient
                        colors={
                            pressed
                                ? ["#151519", "#3f5e43"]
                                : ["#1d1d23", "#5a835f"]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.button, pressed && styles.buttonPressed]}
                    >
                        <MaterialIcons
                            name="add"
                            size={16}
                            color="#5a835f"
                            style={{ paddingRight: 8 }}
                        />
                        <Text style={styles.text}>Crear nueva rutina</Text>
                    </LinearGradient>
                )}
            </Pressable>

            <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
                <Collapsible
                    isOpen={openSection === "a"}
                    onOpenChange={open => setOpenSection(open ? "a" : null)}
                    label="Mis rutinas de estudio"
                    labelStyle={{
                        color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
                        fontSize: 20,
                        fontWeight: "500",
                    }}
                >
                    <Column spacing={8} style={{ paddingTop: 8 }}>
                        <ListItem
                            onPress={() => startSession("Álgebra")}
                            colors={{ containerColor: "#1d1d23" }}
                            modifiers={[
                                padding({ all: 12 }),
                                background("#1d1d23", shapes.roundedRectangle({ cornerRadius: 8 })),
                            ]}
                        >
                            <ListItem.Leading>
                                <Icon name={STAR} size={16} color="#16A34A" />
                            </ListItem.Leading>
                            <Row spacing={0}>
                                <ExpoText textStyle={{ color: "gray" }}>{`Álgebra `}</ExpoText>
                            </Row>
                            <ListItem.Supporting>Álgebra II, Ecuaciones, Discreta</ListItem.Supporting>
                        </ListItem>
                    </Column>

                    <Column spacing={8}>
                        <ListItem
                            onPress={() => startSession("Cálculo")}
                            colors={{ containerColor: "#1d1d23" }}
                            modifiers={[
                                padding({ all: 12 }),
                                background("#1d1d23", shapes.roundedRectangle({ cornerRadius: 8 })),
                            ]}
                        >
                            <ListItem.Leading>
                                <Icon name={BOOK} size={16} color="#16A34A" />
                            </ListItem.Leading>
                            <Row spacing={0}>
                                <ExpoText textStyle={{ color: "gray" }}>{`Cálculo`}</ExpoText>
                            </Row>
                            <ListItem.Supporting>Ampliación de análisis, Funcional</ListItem.Supporting>
                        </ListItem>
                    </Column>
                </Collapsible>
            </Host>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        maxWidth: MaxContentWidth,
        flexGrow: 1,
        paddingHorizontal: Spacing.four,
    },
    titleContainer: {
        alignItems: "flex-start",
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.six,
        paddingBottom: Spacing.three,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        height: 56,
        paddingHorizontal: 24,
        marginBottom: 8,
        borderRadius: 8,
    },
    buttonPressed: {
        opacity: 0.85,
    },
    text: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
    },
});