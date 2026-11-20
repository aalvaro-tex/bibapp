const COMPARISONS = [
    { minutes: 0, text: "pestañeado y da gracias!" },
    { minutes: 1, text: "contado hasta 60!" },
    { minutes: 2, text: "echado varios polvos seguidos!" },
    { minutes: 3, text: "escuchado 'Superestrella' de Aitana!" },
    { minutes: 5, text: "preparado un café en cápsulas y volver a tu mesa!" },
    { minutes: 8, text: "esperado el ascensor de una facultad en época de exámenes!" },
    { minutes: 10, text: "ver el resumen de una jornada de LaLiga!" },
    { minutes: 15, text: "ver el descanso completo de un partido de fútbol!" },
    { minutes: 20, text: "jugar una partida completa de FC 26!" },
    { minutes: 25, text: "terminar un episodio de 'Bluey' con tu sobrino!" },
    { minutes: 30, text: "ver un episodio de 'Friends'!" },
    { minutes: 35, text: "hacer el trayecto en Cercanías entre Alcalá y Atocha!" },
    { minutes: 45, text: "ver toda la primera parte de un partido de fútbol!" },
    { minutes: 50, text: "terminar un episodio de 'Paquita Salas'!" },
    { minutes: 60, text: "hacer una sesión completa de gimnasio!" },
    { minutes: 75, text: "volar de Madrid a Barcelona!" },
    { minutes: 90, text: "ver 'Shrek' casi entera!" },
    { minutes: 95, text: "ver 'Torrente 5' completa!" },
    { minutes: 105, text: "correr una media maratón en 1h45!" },
    { minutes: 120, text: "ver un partido de fútbol completo con descanso!" },
    { minutes: 150, text: "hacer un viaje AVE de Madrid a Valencia!" },
    { minutes: 180, text: "ver 'El Señor de los Anillos: La Comunidad del Anillo' casi completa!" },
];

export function getComparisonForBreakMinutes(minutes: number): string {
    const closest = COMPARISONS.reduce((prev, curr) =>
        Math.abs(curr.minutes - minutes) < Math.abs(prev.minutes - minutes)
            ? curr
            : prev
    );

    return closest.text;
}