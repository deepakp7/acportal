import { supabase } from '../lib/supabase';

export const websiteService = {
    async getFixtures() {
        const { data, error } = await supabase
            .from('club_fixtures')
            .select('*')
            .order('date', { ascending: true });
        if (error) throw error;
        return data;
    },

    async getRecords() {
        const { data, error } = await supabase
            .from('club_records')
            .select('*')
            .order('event', { ascending: true });
        if (error) throw error;
        return data;
    },

    async getTrainingSessions(group = 'Adults') {
        const { data, error } = await supabase
            .from('training_sessions')
            .select('*')
            .where('target_group', 'eq', group)
            .where('is_active', 'eq', true)
            .order('day', { ascending: true });
        if (error) throw error;
        return data;
    }
};
