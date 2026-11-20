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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getComparisonForBreakMinutes } from "@/data/break-comparisons";

export type BreakShareCardHandle = {
    exportAsPng: () => Promise<string>;
};

type BreakShareCardProps = {
    minutes: number;
    comparison?: string;
};

export const BreakShareCard = forwardRef<
    BreakShareCardHandle,
    BreakShareCardProps
>(function BreakShareCard(
    { minutes, comparison },
    ref: ForwardedRef<BreakShareCardHandle>
) {
    const cardRef = useRef<ComponentRef<typeof View>>(null);
    const safeMinutes = Math.max(0, Math.floor(minutes));

    const resolvedComparison = useMemo(
        () => comparison ?? getComparisonForBreakMinutes(safeMinutes),
        [safeMinutes, comparison]
    );

    useImperativeHandle(
        ref,
        () => ({
            exportAsPng: async () => {
                if (!cardRef.current) {
                    throw new Error("La tarjeta de descanso todavía no está montada");
                }

                const uri = await captureRef(cardRef.current, {
                    format: "png",
                    quality: 1,
                    result: "tmpfile",
                });

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

            <MaterialCommunityIcons
                name="coffee-outline"
                size={132}
                color="#E5E7EB"
            />

            <View style={styles.minutesBlock}>
                <Text style={styles.introText}>
                    Has descansado
                </Text>

                <View style={styles.minutesRow}>
                    <Text style={styles.minutesNumber}>
                        {safeMinutes}
                    </Text>

                    <Text style={styles.minutesUnit}>
                        {safeMinutes === 1 ? "minuto" : "minutos"}
                    </Text>
                </View>
            </View>

            <View style={styles.comparisonBlock}>
                <Text style={styles.equivalentText}>
                    ¡En ese tiempo podrías haber
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
        width: "100%",
        height: "100%",
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

    minutesBlock: {
        alignItems: "center",
        gap: 2,
    },

    introText: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "400",
    },

    minutesRow: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 12,
    },

    minutesNumber: {
        color: "#FFFFFF",
        fontSize: 44,
        fontWeight: "500",
        fontVariant: ["tabular-nums"],
    },

    minutesUnit: {
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
        fontSize: 20,
        fontWeight: "700",
        textAlign: "right",
    },
});