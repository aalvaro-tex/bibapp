import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useStudySession } from "@/context/study-session-context";

export function useBreakAction() {
    const { isOnBreak, cancelBreak } = useStudySession();
    const [isBreakDialogVisible, setIsBreakDialogVisible] = useState(false);

    const handleBreakPress = useCallback(() => {
        if (isOnBreak) {
            Alert.alert(
                "Finalizar descanso",
                "¿Quieres finalizar el descanso actual y volver a estudiar?",
                [
                    {
                        text: "Cancelar",
                        style: "cancel",
                    },
                    {
                        text: "Finalizar",
                        style: "default",
                        onPress: () => {
                            cancelBreak();
                        },
                    },
                ]
            );
            return;
        }

        setIsBreakDialogVisible(true);
    }, [isOnBreak, cancelBreak]);

    return {
        isBreakDialogVisible,
        setIsBreakDialogVisible,
        handleBreakPress,
    };
}