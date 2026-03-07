import { supabase } from '../lib/supabase';

export const socialService = {
    async getPosts() {
        const { data, error } = await supabase
            .from('club_posts')
            .select(`
                *,
                author:athletes!author_id(name, photo_url),
                likes:club_likes(count),
                comments:club_comments(
                    *,
                    athlete:athletes(name, photo_url)
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(post => ({
            ...post,
            likeCount: post.likes[0]?.count || 0,
            commentCount: post.comments?.length || 0
        }));
    },

    async createPost(content, title = null, mediaUrl = null, mediaType = null) {
        const { data, error } = await supabase
            .from('club_posts')
            .insert([{ content, title, media_url: mediaUrl, media_type: mediaType }])
            .select();

        if (error) throw error;
        return data[0];
    },

    async toggleLike(postId, athleteId) {
        // Check if already liked
        const { data: existing } = await supabase
            .from('club_likes')
            .select('id')
            .eq('post_id', postId)
            .eq('athlete_id', athleteId)
            .single();

        if (existing) {
            const { error } = await supabase
                .from('club_likes')
                .delete()
                .eq('id', existing.id);
            if (error) throw error;
            return false; // Unliked
        } else {
            const { error } = await supabase
                .from('club_likes')
                .insert([{ post_id: postId, athlete_id: athleteId }]);
            if (error) throw error;
            return true; // Liked
        }
    },

    async addComment(postId, athleteId, content) {
        const { data, error } = await supabase
            .from('club_comments')
            .insert([{ post_id: postId, athlete_id: athleteId, content }])
            .select(`
                *,
                athlete:athletes(name, photo_url)
            `);

        if (error) throw error;
        return data[0];
    }
};
