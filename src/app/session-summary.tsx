import { useEffect, useRef, useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import { ThemedText } from "@/components/themed-text";
import {
    StudyShareCard,
    type StudyShareCardHandle,
} from "@/components/study-share-card";
import {
    BreakShareCard,
    type BreakShareCardHandle,
} from "@/components/break-share-card";
import { CrossConfetti } from "@/components/cross-confetti";
import { Spacing } from "@/constants/theme";
import { useStudySession } from "@/context/study-session-context";

export default function SessionSummaryScreen() {
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const { lastSessionSummary } = useStudySession();

    const [isExporting, setIsExporting] = useState(false);
    const [celebrationKey, setCelebrationKey] = useState(0);
    const [slotWidth, setSlotWidth] = useState(0);
    const [activeCardIndex, setActiveCardIndex] = useState(0);

    const shareCardRef = useRef<StudyShareCardHandle>(null);
    const breakCardRef = useRef<BreakShareCardHandle>(null);

    const isDark = colorScheme === "dark";
    const textColor = isDark ? "#FFFFFF" : "#000000";
    const secondaryColor = isDark ? "#A1A1AA" : "#71717A";
    const cardBg = isDark ? "#18181B" : "#F4F4F5";
    const borderColor = isDark ? "#27272A" : "#E4E4E7";

    const sessionNumber = lastSessionSummary?.sessionNumber ?? 1;
    const sessionName = lastSessionSummary?.title?.trim() || "Sesión libre";
    const elapsedTime = lastSessionSummary?.formattedElapsedTime ?? "00:00:00";
    const breakTime = lastSessionSummary?.formattedBreakTime ?? "00:00:00";
    const totalTopics = lastSessionSummary?.totalTopicsCount ?? 0;

    // Horas estudiadas a partir de los segundos acumulados en la sesión
    const studiedHours = Math.max(
        1,
        Math.floor((lastSessionSummary?.elapsedSeconds ?? 0) / 3600)
    );

    // Minutos descansados a partir de los segundos de descanso acumulados
    const breakMinutes = Math.max(
        0,
        Math.round((lastSessionSummary?.breakSeconds ?? 0) / 60)
    );

    const triggerCelebration = () => {
        setCelebrationKey((prev) => prev + 1);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            triggerCelebration();
        }, 250);

        return () => clearTimeout(timer);
    }, []);

    const handleExportPng = async () => {
        try {
            setIsExporting(true);
            const pngUri =
                activeCardIndex === 0
                    ? await shareCardRef.current?.exportAsPng()
                    : await breakCardRef.current?.exportAsPng();

            if (!pngUri) return;

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(pngUri, {
                    mimeType: "image/png",
                    UTI: "public.png",
                });
            } else {
                Alert.alert("PNG generado", `Imagen guardada en: ${pngUri}`);
            }
        } catch {
            Alert.alert("Error", "No se pudo generar la imagen PNG.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleGoHome = () => {
        router.replace("/");
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: isDark ? "#000000" : "#FFFFFF",
                    paddingTop: insets.top + Spacing.three,
                    paddingBottom: Math.max(insets.bottom, Spacing.four),
                },
            ]}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* 1. Icono de completado y texto "Sesión completada" */}
                <View style={styles.completedHeader}>
                    <ThemedText type="subtitle" style={styles.title}>
                        Sesión completada
                    </ThemedText>
                </View>

                {/* 2. Nombre de la sesión */}
                <Text style={[styles.sessionName, { color: secondaryColor }]}>
                    {sessionName}
                </Text>

                {/* 3. Resumen compacto */}
                <View style={styles.paddedSection}>
                    <View
                        style={[
                            styles.summaryCard,
                            { backgroundColor: cardBg, borderColor },
                        ]}
                    >
                        <View
                            style={[
                                styles.summaryRow,
                                { borderBottomColor: borderColor },
                            ]}
                        >
                            <Text
                                style={[styles.rowLabel, { color: secondaryColor }]}
                            >
                                Número de sesión
                            </Text>
                            <Text style={[styles.rowValue, { color: textColor }]}>
                                #{sessionNumber}
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.summaryRow,
                                { borderBottomColor: borderColor },
                            ]}
                        >
                            <Text
                                style={[styles.rowLabel, { color: secondaryColor }]}
                            >
                                Tiempo
                            </Text>
                            <Text
                                style={[
                                    styles.rowValue,
                                    styles.tabular,
                                    { color: textColor },
                                ]}
                            >
                                {elapsedTime}
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.summaryRow,
                                { borderBottomColor: borderColor },
                            ]}
                        >
                            <Text
                                style={[styles.rowLabel, { color: secondaryColor }]}
                            >
                                Tiempo de descanso
                            </Text>
                            <Text
                                style={[
                                    styles.rowValue,
                                    styles.tabular,
                                    { color: textColor },
                                ]}
                            >
                                {breakTime}
                            </Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text
                                style={[styles.rowLabel, { color: secondaryColor }]}
                            >
                                Temas totales
                            </Text>
                            <Text
                                style={[
                                    styles.rowValue,
                                    styles.tabular,
                                    { color: textColor },
                                ]}
                            >
                                {totalTopics}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 4. Carrusel cuadrado adaptado al ancho disponible */}
                <View style={styles.paddedSection}>
                    <View
                        onLayout={(e) => {
                            const measuredWidth = Math.round(
                                e.nativeEvent.layout.width
                            );
                            if (measuredWidth > 0 && measuredWidth !== slotWidth) {
                                setSlotWidth(measuredWidth);
                            }
                        }}
                        style={[
                            styles.cardSlot,
                            {
                                borderColor: isDark ? "#27272A" : "#E4E4E7",
                                backgroundColor: "#000000",
                            },
                        ]}
                    >
                        {slotWidth > 0 && (
                            <ScrollView
                                horizontal
                                pagingEnabled
                                nestedScrollEnabled
                                directionalLockEnabled
                                showsHorizontalScrollIndicator={false}
                                style={{ width: slotWidth, height: slotWidth }}
                                onMomentumScrollEnd={(e) => {
                                    const page = Math.round(
                                        e.nativeEvent.contentOffset.x / slotWidth
                                    );
                                    setActiveCardIndex(
                                        Math.max(0, Math.min(1, page))
                                    );
                                }}
                            >
                                <View
                                    style={{
                                        width: slotWidth,
                                        height: slotWidth,
                                    }}
                                >
                                    <StudyShareCard
                                        ref={shareCardRef}
                                        hours={studiedHours}
                                    />
                                </View>

                                <View
                                    style={{
                                        width: slotWidth,
                                        height: slotWidth,
                                    }}
                                >
                                    <BreakShareCard
                                        ref={breakCardRef}
                                        minutes={breakMinutes}
                                    />
                                </View>
                            </ScrollView>
                        )}
                    </View>

                    {/* Indicadores de página del carrusel */}
                    <View style={styles.dotsRow}>
                        {[0, 1].map((dotIndex) => {
                            const isActive = activeCardIndex === dotIndex;
                            return (
                                <View
                                    key={dotIndex}
                                    style={[
                                        styles.dot,
                                        {
                                            backgroundColor: isActive
                                                ? "#5a835f"
                                                : isDark
                                                    ? "#3F3F46"
                                                    : "#D4D4D8",
                                            width: isActive ? 18 : 7,
                                        },
                                    ]}
                                />
                            );
                        })}
                    </View>

                    {/* Fila dividida a la mitad: Compartir PNG + Celebrar */}
                    <View style={styles.actionRow}>
                        <Pressable
                            disabled={isExporting}
                            onPress={handleExportPng}
                            accessibilityLabel="Exportar gráfica PNG"
                            style={({ pressed }) => [
                                styles.exportButton,
                                { backgroundColor: cardBg, borderColor },
                                pressed && { opacity: 0.8 },
                                isExporting && { opacity: 0.5 },
                            ]}
                        >
                            <MaterialIcons
                                name="ios-share"
                                size={18}
                                color={textColor}
                            />
                            <Text
                                style={[
                                    styles.exportButtonText,
                                    { color: textColor },
                                ]}
                                numberOfLines={1}
                            >
                                {isExporting ? "Generando..." : "Compartir PNG"}
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={triggerCelebration}
                            accessibilityLabel="Celebrar y lanzar confeti"
                            style={({ pressed }) => [
                                styles.celebrateButton,
                                { backgroundColor: cardBg, borderColor },
                                pressed && { opacity: 0.8 },
                            ]}
                        >
                            <MaterialIcons
                                name="celebration"
                                size={18}
                                color="#5a835f"
                            />
                            <Text
                                style={[
                                    styles.celebrateButtonText,
                                    { color: textColor },
                                ]}
                                numberOfLines={1}
                            >
                                Celebrar
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>

            {/* 5. Botón para volver a inicio */}
            <View style={styles.paddedSection}>
                <Pressable
                    onPress={handleGoHome}
                    accessibilityLabel="Volver a la página de inicio"
                    style={styles.homePressable}
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
                                styles.homeButton,
                                pressed && styles.homeButtonPressed,
                            ]}
                        >
                            <MaterialIcons name="home" size={20} color="#FFFFFF" />
                            <Text style={styles.homeButtonText}>
                                Volver a inicio
                            </Text>
                        </LinearGradient>
                    )}
                </Pressable>
            </View>

            <View pointerEvents="none" style={styles.confettiOverlay}>
                <CrossConfetti triggerKey={celebrationKey} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: "center",
        paddingBottom: Spacing.four,
    },
    completedHeader: {
        alignItems: "center",
        gap: 8,
    },
    title: {
        textAlign: "center",
    },
    sessionName: {
        fontSize: 15,
        fontWeight: "600",
        marginTop: 4,
        marginBottom: Spacing.three,
        textAlign: "center",
        paddingHorizontal: Spacing.four,
    },
    paddedSection: {
        width: "100%",
        paddingHorizontal: Spacing.four,
    },
    summaryCard: {
        width: "100%",
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 14,
    },
    summaryRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    rowLabel: {
        fontSize: 14,
        fontWeight: "500",
    },
    rowValue: {
        fontSize: 15,
        fontWeight: "700",
    },
    tabular: {
        fontVariant: ["tabular-nums"],
    },
    cardSlot: {
        width: "100%",
        aspectRatio: 1,
        marginTop: Spacing.three,
        borderRadius: 36,
        borderWidth: 2,
        overflow: "hidden",
    },
    dotsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        marginTop: Spacing.two,
    },
    dot: {
        height: 7,
        borderRadius: 4,
    },
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.two,
        marginTop: Spacing.two,
    },
    exportButton: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingHorizontal: 10,
    },
    exportButtonText: {
        fontSize: 14,
        fontWeight: "600",
    },
    celebrateButton: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingHorizontal: 10,
    },
    celebrateButtonText: {
        fontSize: 14,
        fontWeight: "600",
    },
    homePressable: {
        width: "100%",
        marginTop: Spacing.two,
    },
    homeButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 52,
        borderRadius: 12,
        paddingHorizontal: 24,
    },
    homeButtonPressed: {
        opacity: 0.85,
    },
    homeButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    confettiOverlay: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 99,
    },
});