import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Mock data will be used if provided.')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export const checkConnection = async () => {
    try {
        const { data, error } = await supabase.from('coaches').select('id').limit(1)
        if (error) throw error
        return { connected: true, error: null }
    } catch (err) {
        return { connected: false, error: err.message }
    }
}
