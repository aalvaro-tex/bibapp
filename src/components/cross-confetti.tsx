import React, { useEffect, useMemo } from "react";
import {
    StyleSheet,
    View,
    useWindowDimensions,
} from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

const DEFAULT_COLORS = [
    "#22c55e",
    "#16a34a",
    "#84cc16",
    "#eab308",
    "#f59e0b",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#ef4444",
];

type CrossConfettiProps = {
    triggerKey: number;
    colors?: string[];
    countPerSide?: number;
};

type Piece = {
    id: string;

    x0: number;
    y0: number;

    vx: number;
    vy: number;

    gravity: number;

    width: number;
    height: number;

    color: string;

    duration: number;

    rotationSpeed: number;

    swayAmplitude: number;
    swayFrequency: number;

    flipSpeed: number;

    depthScale: number;
    baseOpacity: number;

    shape: "rect" | "circle" | "ribbon";
};

function createPieces(
    width: number,
    height: number,
    countPerSide: number,
    colors: string[]
): Piece[] {
    const pieces: Piece[] = [];

    for (const side of ["left", "right"] as const) {
        const cannonY =
            height * (0.92 + (Math.random() - 0.5) * 0.04);

        for (let i = 0; i < countPerSide; i++) {
            const sizeType = Math.random();

            let pieceWidth = 8;
            let pieceHeight = 6;

            if (sizeType < 0.35) {
                pieceWidth = 5;
                pieceHeight = 4;
            } else if (sizeType > 0.85) {
                pieceWidth = 14;
                pieceHeight = 10;
            }

            const shapeRand = Math.random();

            let shape: Piece["shape"] = "rect";

            if (shapeRand < 0.15) {
                shape = "circle";
            } else if (shapeRand < 0.4) {
                shape = "ribbon";
            }

            if (shape === "ribbon") {
                pieceWidth = 4;
                pieceHeight = 16 + Math.random() * 12;
            }

            const depth = Math.random();

            let depthScale = 1;
            let opacity = 1;

            if (depth < 0.2) {
                depthScale = 0.75;
                opacity = 0.55;
            } else if (depth > 0.8) {
                depthScale = 1.4;
                opacity = 1;
            }

            const targetX =
                side === "left"
                    ? width * 0.6
                    : width * 0.4;

            const startX =
                side === "left"
                    ? -20
                    : width + 20;

            const flightTime =
                0.9 + Math.random() * 0.25;

            const speedX =
                (targetX - startX) / flightTime;

            const speedY =
                -(900 + Math.random() * 500);

            pieces.push({
                id: `${side}-${i}-${Math.random()}`,

                x0:
                    side === "left"
                        ? -20 + Math.random() * 15
                        : width + 20 - Math.random() * 15,

                y0:
                    cannonY +
                    (Math.random() - 0.5) * 40,

                vx: speedX,

                vy: speedY,

                gravity:
                    1200 + Math.random() * 300,

                width: pieceWidth,
                height: pieceHeight,

                color:
                    colors[
                    Math.floor(
                        Math.random() * colors.length
                    )
                    ],

                duration:
                    1800 + Math.random() * 1400,

                rotationSpeed:
                    (Math.random() > 0.5 ? 1 : -1) *
                    (450 + Math.random() * 950),

                swayAmplitude:
                    15 + Math.random() * 25,

                swayFrequency:
                    4 + Math.random() * 8,

                flipSpeed:
                    8 + Math.random() * 10,

                depthScale,

                baseOpacity: opacity,

                shape,
            });
        }
    }

    return pieces;
}

function ConfettiParticle({
    piece,
}: {
    piece: Piece;
}) {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = 0;

        progress.value = withTiming(1, {
            duration: piece.duration,
            easing: Easing.linear,
        });
    }, []);

    const durationSeconds =
        piece.duration / 1000;

    const animatedStyle = useAnimatedStyle(() => {
        const t =
            progress.value * durationSeconds;

        const sway =
            Math.sin(
                t * piece.swayFrequency
            ) * piece.swayAmplitude;

        const x =
            piece.x0 +
            piece.vx * t +
            sway;

        const y =
            piece.y0 +
            piece.vy * t +
            0.5 *
            piece.gravity *
            t *
            t;

        const rotation =
            piece.rotationSpeed * t +
            Math.sin(t * 5) * 40;

        const flip =
            0.6 +
            Math.abs(
                Math.sin(
                    t * piece.flipSpeed
                )
            ) *
            0.8;

        let opacity = piece.baseOpacity;

        if (progress.value < 0.08) {
            opacity *=
                progress.value / 0.08;
        } else if (progress.value > 0.92) {
            opacity *=
                (1 - progress.value) / 0.08;
        }

        const burstScale =
            progress.value < 0.08
                ? progress.value / 0.08
                : 1;

        return {
            opacity,

            transform: [
                {
                    translateX: x,
                },
                {
                    translateY: y,
                },
                {
                    rotate: `${rotation}deg`,
                },
                {
                    scale:
                        piece.depthScale *
                        burstScale,
                },
                {
                    scaleX: flip,
                },
            ],
        };
    });

    return (
        <Animated.View
            style={[
                styles.piece,
                animatedStyle,
                {
                    width: piece.width,
                    height: piece.height,
                    backgroundColor: piece.color,

                    borderRadius:
                        piece.shape === "circle"
                            ? 999
                            : piece.shape === "ribbon"
                                ? 3
                                : 2,
                },
            ]}
        />
    );
}

export function CrossConfetti({
    triggerKey,
    colors = DEFAULT_COLORS,
    countPerSide = 60,
}: CrossConfettiProps) {
    const { width, height } =
        useWindowDimensions();

    const pieces = useMemo(
        () =>
            createPieces(
                width,
                height,
                countPerSide,
                colors
            ),
        [
            triggerKey,
            width,
            height,
            countPerSide,
            colors,
        ]
    );

    if (!triggerKey) {
        return null;
    }

    return (
        <View
            pointerEvents="none"
            style={styles.overlay}
        >
            {pieces.map((piece) => (
                <ConfettiParticle
                    key={`${triggerKey}-${piece.id}`}
                    piece={piece}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFill,
        zIndex: 999,
        overflow: "hidden",
    },

    piece: {
        position: "absolute",
        borderRadius: 2,
    },
});