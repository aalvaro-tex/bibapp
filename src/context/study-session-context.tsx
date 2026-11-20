import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import { router } from "expo-router";
import { LocalSubject } from "./subjects-context";
import {
    cancelBreakEndingNotification,
    scheduleBreakEndingNotification,
} from "@/utils/break-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type TopicType = "P" | "E" | "R" | "A";
const SESSIONS_STORAGE_KEY = "@estudy/completed_sessions";
export type SessionTopic = {
    id: string;
    name: string;
    type: TopicType;
    completed: boolean;
};

export type SessionSubject = {
    id: string;
    subjectId: string;
    name: string;
    color: string;
    topics: SessionTopic[];
};

export type SessionSummary = {
    id: string;
    sessionNumber: number;
    title: string;
    completedAt: string; // ISO string
    formattedElapsedTime: string;
    elapsedSeconds: number;
    formattedBreakTime: string;
    breakSeconds: number;
    totalTopicsCount: number;
    completedTopicsCount: number;
    subjects: {
        id: string;
        name: string;
        color: string;
    }[];
};

type StudySessionContextValue = {
    isSessionActive: boolean;
    isModalVisible: boolean;
    title: string;
    formattedElapsedTime: string;
    studiedTopicsCount: number;
    startSession: (sessionTitle?: string) => void;
    minimizeSession: () => void;
    reopenSession: () => void;
    finishSession: () => void;
    subjects: SessionSubject[];
    addSubject: (subject: LocalSubject) => void;
    removeSubject: (sessionSubjectId: string) => void;
    setIsModalVisible: (visible: boolean) => void;
    toggleTopicCompleted: (sessionSubjectId: string, topicId: string) => void;
    addTopic: (
        sessionSubjectId: string,
        topicName: string,
        topicType: TopicType
    ) => void;
    isOnBreak: boolean;
    formattedBreakTime: string;
    lastSessionSummary: SessionSummary | null;
    toggleBreak: () => void;
    completeSession: () => SessionSummary;
    breakRemainingSeconds: number;
    formattedBreakRemainingTime: string;
    startBreak: (durationMinutes: number) => void;
    cancelBreak: () => void;
    breakSeconds: number;
    completedSessions: SessionSummary[];
};

const StudySessionContext = createContext<StudySessionContextValue | null>(null);

const formatDuration = (totalSeconds: number) =>
    [
        Math.floor(totalSeconds / 3600),
        Math.floor((totalSeconds % 3600) / 60),
        totalSeconds % 60,
    ]
        .map(value => value.toString().padStart(2, "0"))
        .join(":");

export function StudySessionProvider({ children }: { children: ReactNode }) {
    const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [title, setTitle] = useState("Sesión libre");
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    const breakNotificationIdRef = useRef<string | null>(null);

    const isSessionActive = sessionStartedAt !== null;

    const accumulatedStudySecondsRef = useRef(0);
    const activeStudySegmentStartRef = useRef<number | null>(null);

    const accumulatedBreakSecondsRef = useRef(0);
    const activeBreakSegmentStartRef = useRef<number | null>(null);

    const [completedSessions, setCompletedSessions] = useState<SessionSummary[]>([]);

    const [subjects, setSubjects] = useState<SessionSubject[]>([]);
    const [breakSeconds, setBreakSeconds] = useState(0);
    const [isOnBreak, setIsOnBreak] = useState(false);
    const [completedSessionsCount, setCompletedSessionsCount] = useState(0);
    const [lastSessionSummary, setLastSessionSummary] =
        useState<SessionSummary | null>(null);

    const [breakDurationSeconds, setBreakDurationSeconds] = useState(0);
    const [breakStartedAt, setBreakStartedAt] = useState<number | null>(null);
    const [breakRemainingSeconds, setBreakRemainingSeconds] = useState(0);

    const clearScheduledBreakNotification = () => {
        if (breakNotificationIdRef.current) {
            cancelBreakEndingNotification(breakNotificationIdRef.current);
            breakNotificationIdRef.current = null;
        }
    };

    const addSubject = (subject: LocalSubject) => {
        setSubjects(prev => {
            if (prev.some(item => item.subjectId === subject.id)) {
                return prev;
            }
            return [
                ...prev,
                {
                    id: `${subject.id}-${Date.now()}`,
                    subjectId: subject.id,
                    name: subject.name,
                    color: subject.color,
                    topics: [],
                },
            ];
        });
    };

    const removeSubject = (sessionSubjectId: string) => {
        setSubjects(prev => prev.filter(subject => subject.id !== sessionSubjectId));
    };

    useEffect(() => {
        AsyncStorage.getItem(SESSIONS_STORAGE_KEY).then((raw) => {
            if (raw) {
                setCompletedSessions(JSON.parse(raw));
            }
        });
    }, []);

    const syncTimers = () => {
        const now = Date.now();

        // Tiempo total de sesión continuo (no se detiene durante los descansos)
        const totalSessionSeconds =
            sessionStartedAt !== null
                ? Math.max(0, Math.floor((now - sessionStartedAt) / 1000))
                : 0;

        const currentBreak =
            activeBreakSegmentStartRef.current !== null
                ? Math.max(
                    0,
                    Math.floor((now - activeBreakSegmentStartRef.current) / 1000)
                )
                : 0;

        setElapsedSeconds(totalSessionSeconds);
        setBreakSeconds(accumulatedBreakSecondsRef.current + currentBreak);

        if (isOnBreak && breakStartedAt !== null && breakDurationSeconds > 0) {
            const elapsedSinceBreakStart = Math.max(
                0,
                Math.floor((now - breakStartedAt) / 1000)
            );
            const remaining = Math.max(
                0,
                breakDurationSeconds - elapsedSinceBreakStart
            );
            setBreakRemainingSeconds(remaining);

            if (remaining === 0) {
                accumulatedBreakSecondsRef.current += currentBreak;
                activeBreakSegmentStartRef.current = null;
                setBreakStartedAt(null);
                setBreakDurationSeconds(0);
                setIsOnBreak(false);
                clearScheduledBreakNotification();
            }
        } else {
            setBreakRemainingSeconds(0);
        }
    };

    useEffect(() => {
        if (!isSessionActive) {
            setElapsedSeconds(0);
            setBreakSeconds(0);
            setBreakRemainingSeconds(0);
            return;
        }

        syncTimers();
        const interval = setInterval(syncTimers, 1000);

        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === "active") {
                syncTimers();
            }
        };

        const subscription = AppState.addEventListener(
            "change",
            handleAppStateChange
        );

        return () => {
            clearInterval(interval);
            subscription.remove();
        };
    }, [isSessionActive, isOnBreak, breakStartedAt, breakDurationSeconds]);

    const formattedElapsedTime = formatDuration(elapsedSeconds);
    const formattedBreakTime = formatDuration(breakSeconds);
    const formattedBreakRemainingTime = formatDuration(breakRemainingSeconds);

    const studiedTopicsCount = subjects.reduce(
        (total, subject) =>
            total + subject.topics.filter(topic => topic.completed).length,
        0
    );

    const totalTopicsCount = subjects.reduce(
        (total, subject) => total + subject.topics.length,
        0
    );

    const startBreak = (durationMinutes: number) => {
        if (!isSessionActive || durationMinutes <= 0) return;

        const now = Date.now();
        const totalSeconds = Math.round(durationMinutes * 60);

        clearScheduledBreakNotification();
        scheduleBreakEndingNotification(totalSeconds).then(id => {
            breakNotificationIdRef.current = id;
        });

        if (activeStudySegmentStartRef.current !== null) {
            accumulatedStudySecondsRef.current += Math.max(
                0,
                Math.floor((now - activeStudySegmentStartRef.current) / 1000)
            );
            activeStudySegmentStartRef.current = null;
        }

        activeBreakSegmentStartRef.current = now;
        setBreakStartedAt(now);
        setBreakDurationSeconds(totalSeconds);
        setBreakRemainingSeconds(totalSeconds);
        setIsOnBreak(true);
        syncTimers();
    };

    const cancelBreak = () => {
        if (!isSessionActive || !isOnBreak) return;

        clearScheduledBreakNotification();

        const now = Date.now();

        if (activeBreakSegmentStartRef.current !== null) {
            accumulatedBreakSecondsRef.current += Math.max(
                0,
                Math.floor((now - activeBreakSegmentStartRef.current) / 1000)
            );
            activeBreakSegmentStartRef.current = null;
        }

        activeStudySegmentStartRef.current = now;
        setBreakStartedAt(null);
        setBreakDurationSeconds(0);
        setBreakRemainingSeconds(0);
        setIsOnBreak(false);
        syncTimers();
    };

    const toggleBreak = () => {
        if (!isSessionActive) return;
        if (isOnBreak) {
            cancelBreak();
        } else {
            startBreak(5);
        }
    };

    const resetClockRefs = () => {
        clearScheduledBreakNotification();
        accumulatedStudySecondsRef.current = 0;
        activeStudySegmentStartRef.current = null;
        accumulatedBreakSecondsRef.current = 0;
        activeBreakSegmentStartRef.current = null;
        setBreakStartedAt(null);
        setBreakDurationSeconds(0);
        setBreakRemainingSeconds(0);
    };

    const completeSession = (): SessionSummary => {
        const now = Date.now();
        const finalSessionSeconds =
            sessionStartedAt !== null
                ? Math.max(0, Math.floor((now - sessionStartedAt) / 1000))
                : elapsedSeconds;

        const finalBreakSeconds =
            accumulatedBreakSecondsRef.current +
            (activeBreakSegmentStartRef.current !== null
                ? Math.max(
                    0,
                    Math.floor((now - activeBreakSegmentStartRef.current) / 1000)
                )
                : 0);

        const nextSessionNumber = completedSessions.length + 1;
        const summary: SessionSummary = {
            id: `${now}-${nextSessionNumber}`,
            sessionNumber: nextSessionNumber,
            title,
            completedAt: new Date(now).toISOString(),
            formattedElapsedTime: formatDuration(finalSessionSeconds),
            elapsedSeconds: finalSessionSeconds,
            formattedBreakTime: formatDuration(finalBreakSeconds),
            breakSeconds: finalBreakSeconds,
            totalTopicsCount,
            completedTopicsCount: studiedTopicsCount,
            subjects: subjects.map((s) => ({
                id: s.subjectId,
                name: s.name,
                color: s.color,
            })),
        };

        const updatedSessions = [summary, ...completedSessions];
        setCompletedSessions(updatedSessions);
        AsyncStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updatedSessions));

        setCompletedSessionsCount(nextSessionNumber);
        setLastSessionSummary(summary);
        setIsModalVisible(false);
        setIsOnBreak(false);
        setSessionStartedAt(null);
        setElapsedSeconds(0);
        setBreakSeconds(0);
        resetClockRefs();
        setSubjects([]);

        return summary;
    };

    const startSession = (sessionTitle = "Sesión libre") => {
        if (!isSessionActive) {
            const now = Date.now();
            accumulatedStudySecondsRef.current = 0;
            activeStudySegmentStartRef.current = now;
            accumulatedBreakSecondsRef.current = 0;
            activeBreakSegmentStartRef.current = null;

            setTitle(sessionTitle);
            setSessionStartedAt(now);
            setElapsedSeconds(0);
            setBreakSeconds(0);
            setBreakStartedAt(null);
            setBreakDurationSeconds(0);
            setBreakRemainingSeconds(0);
            setIsOnBreak(false);
            setSubjects([]);
        }
        if (!isModalVisible) {
            setIsModalVisible(true);
            router.push("/session-modal");
        }
    };

    const minimizeSession = () => {
        if (router.canGoBack()) {
            router.back();
        }
        setIsModalVisible(false);
    };

    const reopenSession = () => {
        if (isSessionActive && !isModalVisible) {
            setIsModalVisible(true);
            router.push("/session-modal");
        }
    };

    const finishSession = () => {
        if (isModalVisible && router.canGoBack()) {
            router.back();
        }
        setIsModalVisible(false);
        setIsOnBreak(false);
        setSessionStartedAt(null);
        setElapsedSeconds(0);
        setBreakSeconds(0);
        resetClockRefs();
        setSubjects([]);
    };

    const addTopic = (
        sessionSubjectId: string,
        topicName: string,
        topicType: TopicType
    ) => {
        const trimmed = topicName.trim();
        if (!trimmed) return;

        setSubjects(prev =>
            prev.map(subject =>
                subject.id === sessionSubjectId
                    ? {
                        ...subject,
                        topics: [
                            ...subject.topics,
                            {
                                id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                                name: trimmed,
                                type: topicType,
                                completed: false,
                            },
                        ],
                    }
                    : subject
            )
        );
    };

    const toggleTopicCompleted = (sessionSubjectId: string, topicId: string) => {
        setSubjects(prev =>
            prev.map(subject =>
                subject.id === sessionSubjectId
                    ? {
                        ...subject,
                        topics: subject.topics.map(topic =>
                            topic.id === topicId
                                ? { ...topic, completed: !topic.completed }
                                : topic
                        ),
                    }
                    : subject
            )
        );
    };

    return (
        <StudySessionContext.Provider
            value={{
                isSessionActive,
                isModalVisible,
                setIsModalVisible,
                title,
                formattedElapsedTime,
                studiedTopicsCount,
                subjects,
                startSession,
                minimizeSession,
                reopenSession,
                finishSession,
                addSubject,
                breakSeconds,
                removeSubject,
                addTopic,
                toggleTopicCompleted,
                isOnBreak,
                formattedBreakTime,
                lastSessionSummary,
                toggleBreak,
                completeSession,
                breakRemainingSeconds,
                formattedBreakRemainingTime,
                startBreak,
                cancelBreak,
                completedSessions
            }}
        >
            {children}
        </StudySessionContext.Provider>
    );
}

export function useStudySession() {
    const context = useContext(StudySessionContext);
    if (!context) {
        throw new Error(
            "useStudySession debe usarse dentro de StudySessionProvider"
        );
    }
    return context;
}