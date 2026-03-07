import { supabase } from '../lib/supabase'

export const meetService = {
    async getAllMeets() {
        const { data, error } = await supabase
            .from('meets')
            .select('*')
            .order('date', { ascending: true })
        if (error) throw error
        return data;
    },

    async registerForMeet(athleteId, meetId, events, notes = '') {
        const { data, error } = await supabase
            .from('meet_registrations')
            .upsert({
                athlete_id: athleteId,
                meet_id: meetId,
                events,
                notes
            }, {
                onConflict: 'athlete_id,meet_id'
            })
            .select()
        if (error) throw error
        return data[0];
    },

    async getMeetRegistrations(meetId) {
        const { data, error } = await supabase
            .from('meet_registrations')
            .select(`
                *,
                athlete:athletes(name, email, type)
            `)
            .eq('meet_id', meetId)
        if (error) throw error
        return data;
    }
}
