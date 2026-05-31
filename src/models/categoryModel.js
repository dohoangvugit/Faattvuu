const supabase = require('../config/supabase');

// Map slug to image file
const categoryImages = {
    'new-arrivals': 'couch1.png',
    'sofas': 'couch2.png',
    'living-room': 'couch3.png',
    'on-sale': 'couch4.png',
    'chairs': 'chair1.png',
};

const CategoryModel = {
    async getAll() {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('id, name, slug')
                .order('id');
            if (error) throw error;
            return { rows: data || [] };
        } catch (error) {
            console.error('❌ Error fetching categories:', error.message);
            return { rows: [] };
        }
    },

    async getOverview() {
        try {
            // Get categories with related product rows for count
            const { data: categories, error } = await supabase
                .from('categories')
                .select(`
                    id,
                    name,
                    slug,
                    product_categories(product_id)
                `)
                .order('id')
                .limit(5);
            if (error) throw error;

            // Map the response to match expected format
            const result = categories.map((cat) => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                total: cat.product_categories?.length || 0,
                image: categoryImages[cat.slug] ? `/img/${categoryImages[cat.slug]}` : null,
            }));

            return { rows: result };
        } catch (error) {
            console.error('❌ Error fetching categories overview:', error.message);
            return { rows: [] };
        }
    },

    async getProductsBySlug(slug) {
        // Use RLS or direct query with relationship
        const { data, error } = await supabase
            .from('products')
            .select(`
                id,
                name,
                price,
                image,
                product_categories!inner(
                    categories!inner(slug)
                )
            `)
            .eq('product_categories.categories.slug', slug)
            .order('id', { ascending: false });
        if (error) throw error;
        
        return { rows: data.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image,
        })) };
    },
};

module.exports = CategoryModel;
