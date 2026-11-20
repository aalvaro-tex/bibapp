const COMPARISONS = [
    {
        label: "ver Torrente 5",
        minutes: 105,
    },
    {
        label: "correr una media maratón",
        minutes: 105, // 1h 45m
    },
    {
        label: "volar de Madrid a Barcelona",
        minutes: 75,
    },
    {
        label: "un tiempo muerto de baloncesto",
        minutes: 1,
    },
];

export function getRandomComparisonForHours(hours: number): string {
    const comparison =
        COMPARISONS[Math.floor(Math.random() * COMPARISONS.length)];

    const times = (hours * 60) / comparison.minutes;

    const formatter = new Intl.NumberFormat("es-ES", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });

    return `${comparison.label} ${formatter.format(times)} veces!`;
}