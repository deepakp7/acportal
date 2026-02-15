import { supabase } from '../lib/supabase'

export const athleteService = {
    async getAll() {
        const { data, error } = await supabase
            .from('athletes')
            .select('*, coaches(*)')
            .order('name', { ascending: true })
        if (error) throw error
        return data.map(item => ({
            ...item,
            coach: item.coaches,
            teamName: item.coaches?.team_name
        }))
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('athletes')
            .select('*')
            .eq('id', id)
            .single()
        if (error) throw error
        return data
    },

    async create(athlete) {
        const { data, error } = await supabase
            .from('athletes')
            .insert([athlete])
            .select()
        if (error) throw error
        return data[0]
    },

    async update(id, updates) {
        const { data, error } = await supabase
            .from('athletes')
            .update(updates)
            .eq('id', id)
            .select()
        if (error) throw error
        return data[0]
    },

    async delete(id) {
        const { error } = await supabase
            .from('athletes')
            .delete()
            .eq('id', id)
        if (error) throw error
    }
}
