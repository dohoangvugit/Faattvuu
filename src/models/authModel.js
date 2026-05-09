const supabase = require('../config/supabase');

const auth = {
    async register(values) {
        const [username, email, phone, password, role] = values;
        const { data, error } = await supabase
            .from('users')
            .insert([{ username, email, phone, password, role }])
            .select()
            .single();
        if (error) throw error;
        return { rows: [data] };
    },

    async login(username, password) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return { rows: data ? [data] : [] };
    },
};

module.exports = auth;
