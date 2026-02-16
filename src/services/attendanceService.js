import { supabase } from '../lib/supabase'

export const attendanceService = {
    async getForDateRange(startDate, endDate, coachId = null) {
        let query = supabase
            .from('attendance')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate)

        if (coachId && coachId !== 'All') {
            query = query.eq('coach_id', coachId)
        }

        const { data, error } = await query.order('date', { ascending: false })
        if (error) throw error
        return data
    },

    async getForAthlete(athleteId) {
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('athlete_id', athleteId)
            .order('date', { ascending: false })
        if (error) throw error
        return data
    },

    async recordAttendance(records) {
        // records: Array<{ athlete_id, coach_id, date, status, result, session_name }>
        const { data, error } = await supabase
            .from('attendance')
            .upsert(records, { onConflict: 'athlete_id, date' })
            .select()
        if (error) throw error
        return data
    },

    async getPerformances(filters = {}) {
        const { date, venue, athleteId } = filters
        let query = supabase
            .from('attendance')
            .select('*')
            .not('result', 'is', null)
            .neq('result', '')

        if (date && date !== 'All') {
            query = query.eq('date', date)
        }
        if (venue && venue !== 'All') {
            query = query.eq('session_name', venue)
        }
        if (athleteId) {
            query = query.eq('athlete_id', athleteId)
        }

        const { data, error } = await query.order('date', { ascending: false })
        if (error) throw error
        return data
    },

    async deleteAttendance(athleteId, date) {
        const { error } = await supabase
            .from('attendance')
            .delete()
            .eq('athlete_id', athleteId)
            .eq('date', date)
        if (error) throw error
    }
}
