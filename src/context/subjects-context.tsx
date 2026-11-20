import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@estudy/local_subjects";

export type LocalSubject = {
    id: string;
    name: string;
    color: string;
};

type SubjectsContextValue = {
    subjects: LocalSubject[];
    isLoading: boolean;
    createSubject: (name: string, color: string) => Promise<LocalSubject>;
    deleteSubject: (id: string) => Promise<void>;
};

const SubjectsContext = createContext<SubjectsContextValue | null>(null);

export function SubjectsProvider({ children }: { children: ReactNode }) {
    const [subjects, setSubjects] = useState<LocalSubject[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSubjects = async () => {
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                if (raw) {
                    setSubjects(JSON.parse(raw));
                }
            } catch (error) {
                console.error("Error cargando asignaturas locales:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSubjects();
    }, []);

    const persistSubjects = async (updated: LocalSubject[]) => {
        setSubjects(updated);
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error("Error guardando asignaturas locales:", error);
        }
    };

    const createSubject = async (name: string, color: string): Promise<LocalSubject> => {
        const newSubject: LocalSubject = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: name.trim(),
            color,
        };
        const updated = [...subjects, newSubject];
        await persistSubjects(updated);
        return newSubject;
    };

    const deleteSubject = async (id: string) => {
        const updated = subjects.filter(subject => subject.id !== id);
        await persistSubjects(updated);
    };

    return (
        <SubjectsContext.Provider
            value={{ subjects, isLoading, createSubject, deleteSubject }}
        >
            {children}
        </SubjectsContext.Provider>
    );
}

export function useLocalSubjects() {
    const context = useContext(SubjectsContext);
    if (!context) {
        throw new Error("useLocalSubjects debe usarse dentro de SubjectsProvider");
    }
    return context;
}