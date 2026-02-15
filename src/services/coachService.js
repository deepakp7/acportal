import { supabase } from '../lib/supabase'

export const coachService = {
    async getAll() {
        const { data, error } = await supabase
            .from('coaches')
            .select('*')
            .order('name', { ascending: true })
        if (error) throw error
        return data
    }
}
