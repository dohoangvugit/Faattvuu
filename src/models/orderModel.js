// src/models/orderModel.js
const supabase = require('../config/supabase');

const orderModel = {
    async createOrder(userId, totalAmount) {
        const { data, error } = await supabase
            .from('orders')
            .insert([
                {
                    user_id: userId,
                    total_amount: totalAmount,
                    status: 'pending',
                },
            ])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async addItem(orderId, productId, quantity, price) {
        const { data, error } = await supabase
            .from('order_items')
            .insert([
                { order_id: orderId, product_id: productId, quantity, price },
            ])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async getById(orderId) {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
        if (error) throw error;
        return data;
    },

    async updateStatus(orderId, status) {
        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async getOrdersByUserId(userId) {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async getOrderItemsWithProducts(orderId) {
        const { data, error } = await supabase
            .from('order_items')
            .select('*, products(*)')
            .eq('order_id', orderId);
        if (error) throw error;
        return data;
    },
};

module.exports = orderModel;
