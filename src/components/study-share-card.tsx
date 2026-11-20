import {
    ComponentRef,
    ForwardedRef,
    forwardRef,
    useImperativeHandle,
    useMemo,
    useRef,
} from "react";
import { StyleSheet, Text, View } from "react-native";
import { captureRef } from "react-native-view-shot";
import { MaterialIcons } from "@expo/vector-icons";

import { getRandomComparisonForHours } from "@/data/study-comparisons";

export type StudyShareCardHandle = {
    exportAsPng: () => Promise<string>;
};

type StudyShareCardProps = {
    hours: number;
    comparison?: string;
};

export const StudyShareCard = forwardRef<
    StudyShareCardHandle,
    StudyShareCardProps
>(function StudyShareCard(
    { hours, comparison },
    ref: ForwardedRef<StudyShareCardHandle>
) {
    const cardRef = useRef<ComponentRef<typeof View>>(null);

    const resolvedComparison = useMemo(
        () => comparison ?? getRandomComparisonForHours(hours),
        [hours, comparison]
    );

    useImperativeHandle(
        ref,
        () => ({
            exportAsPng: async () => {
                if (!cardRef.current) {
                    throw new Error("La tarjeta todavía no está montada");
                }

                const uri = await captureRef(cardRef.current, {
                    format: "png",
                    quality: 1,
                    result: "tmpfile",
                });

                console.log("PNG exportado:", uri);

                return uri;
            },
        }),
        []
    );

    return (
        <View
            ref={cardRef}
            collapsable={false}
            style={styles.card}
        >
            <Text style={styles.watermarkText}>
                Yo estudio con @bibapp
            </Text>

            <MaterialIcons
                name="menu-book"
                size={140}
                color="#E5E7EB"
            />

            <View style={styles.hoursBlock}>
                <Text style={styles.introText}>
                    Has estudiado
                </Text>

                <View style={styles.hoursRow}>
                    <Text style={styles.hoursNumber}>
                        {hours}
                    </Text>

                    <Text style={styles.hoursUnit}>
                        {hours === 1 ? "hora" : "horas"}
                    </Text>
                </View>
            </View>

            <View style={styles.comparisonBlock}>
                <Text style={styles.equivalentText}>
                    ¡Eso es el equivalente a
                </Text>

                <Text style={styles.comparisonText}>
                    {resolvedComparison}
                </Text>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    card: {
        width: 360,
        aspectRatio: 1,
        backgroundColor: "#000000",
        borderRadius: 36,
        paddingHorizontal: 28,
        paddingTop: 42,
        paddingBottom: 28,
        justifyContent: "space-between",
        alignItems: "center",
    },

    watermarkText: {
        position: "absolute",
        top: 18,
        right: 24,
        color: "#A1A1AA",
        fontSize: 12,
        fontWeight: "600",
    },

    hoursBlock: {
        alignItems: "center",
        gap: 2,
    },

    introText: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "400",
    },

    hoursRow: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 14,
    },

    hoursNumber: {
        color: "#FFFFFF",
        fontSize: 44,
        fontWeight: "500",
        fontVariant: ["tabular-nums"],
    },

    hoursUnit: {
        color: "#FFFFFF",
        fontSize: 28,
        fontWeight: "400",
    },

    comparisonBlock: {
        width: "100%",
        gap: 6,
    },

    equivalentText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
        textAlign: "left",
    },

    comparisonText: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "700",
        textAlign: "right",
    },
});