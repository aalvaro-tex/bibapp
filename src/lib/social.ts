import { supabase } from "./supabase.ts";

export type FeedSubjectTopic = {
    id: string;
    name: string;
    type?: "P" | "E" | "R" | "A";
    completed: boolean;
};

export type FeedSessionSubject = {
    id: string;
    subjectId: string;
    name: string;
    color: string;
    topics: FeedSubjectTopic[];
};

export type FeedSessionItem = {
    id: number;
    user_id: number;
    title: string;
    started_at: string;
    duration_seconds: number;
    subjects_data: FeedSessionSubject[];
    created_at: string;
    author: {
        id: number;
        username: string;
        avatar: string | null;
    } | null;
};

// Seguir a un usuario
export async function followUser(followerId: number, followingId: number) {
    if (followerId === followingId) {
        throw new Error("No puedes seguirte a ti mismo.");
    }

    const { error } = await supabase
        .from("follows")
        .insert({ follower_id: followerId, following_id: followingId });

    if (error && error.code !== "23505") {
        throw error;
    }
}

// Dejar de seguir a un usuario
export async function unfollowUser(followerId: number, followingId: number) {
    const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", followerId)
        .eq("following_id", followingId);

    if (error) {
        throw error;
    }
}

// Obtener IDs de usuarios que sigue followerId
export async function getFollowingIds(followerId: number): Promise<number[]> {
    const { data, error } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", followerId);

    if (error) {
        throw error;
    }

    return (data ?? []).map(row => row.following_id);
}

// Buscar usuarios para seguir
export async function searchProfiles(query: string, currentUserId?: number) {
    let req = supabase
        .from("profiles")
        .select("id, username, avatar")
        .order("username", { ascending: true })
        .limit(30);

    if (query.trim().length > 0) {
        req = req.ilike("username", `%${query.trim()}%`);
    }

    if (currentUserId !== undefined) {
        req = req.neq("id", currentUserId);
    }

    const { data, error } = await req;
    if (error) {
        throw error;
    }

    return data ?? [];
}

// Obtener el feed de sesiones de estudio de los amigos (usuarios seguidos)
export async function getFriendsStudyFeed(
    currentUserId: number,
    options?: { includeSelf?: boolean; limit?: number }
): Promise<FeedSessionItem[]> {
    const followingIds = await getFollowingIds(currentUserId);
    const targetUserIds = options?.includeSelf
        ? Array.from(new Set([currentUserId, ...followingIds]))
        : followingIds;

    if (targetUserIds.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from("study_sessions")
        .select(
            `
      id,
      user_id,
      title,
      started_at,
      duration_seconds,
      subjects_data,
      created_at,
      author:profiles!study_sessions_user_id_fkey (
        id,
        username,
        avatar
      )
    `
        )
        .in("user_id", targetUserIds)
        .order("created_at", { ascending: false })
        .limit(options?.limit ?? 30);

    if (error) {
        throw error;
    }

    return (data ?? []) as unknown as FeedSessionItem[];
}