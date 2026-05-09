const cartModel = require('../models/cartModel');
const orderModel = require('../models/orderModel');

class CartController {
    // API GET CART JSON
    async getCart(req, res) {
        try {
            const userId = req.user.id;

            const cart = await cartModel.getOrCreateCart(userId);
            const items = await cartModel.getCartItems(cart.id);

            res.json({ success: true, cartId: cart.id, items });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }

    // ADD TO CART API
    async addToCart(req, res) {
        try {
            const userId = req.user.id;
            const { productId, quantity } = req.body;

            const cart = await cartModel.getOrCreateCart(userId);

            console.log('ADD CART:', cart.id, productId, quantity);

            await cartModel.addItem(
                cart.id,
                Number(productId),
                Number(quantity),
            );

            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }

    async updateCart(req, res) {
        try {
            const userId = req.user.id;
            const { productId, quantity } = req.body;

            const cart = await cartModel.getOrCreateCart(userId);
            await cartModel.updateQuantity(cart.id, productId, quantity);

            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }

    async removeFromCart(req, res) {
        try {
            const userId = req.user.id;
            const { productId } = req.body;

            const cart = await cartModel.getOrCreateCart(userId);
            await cartModel.removeItem(cart.id, productId);

            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }

    // RENDER CART PAGE (HBS)
    async renderCartPage(req, res) {
        try {
            const userId = req.user.id;

            const cart = await cartModel.getOrCreateCart(userId);
            const items = await cartModel.getCartItems(cart.id);

            let total = 0;
            items.forEach((item) => {
                total += item.products.price * item.quantity;
            });

            // Fetch order history
            const orders = await orderModel.getOrdersByUserId(userId);
            
            // Fetch items for each order
            const ordersWithItems = await Promise.all(
                orders.map(async (order) => {
                    const orderItems = await orderModel.getOrderItemsWithProducts(order.id);
                    return { ...order, items: orderItems };
                })
            );

            res.render('cart', {
                cart: items,
                total,
                orders: ordersWithItems,
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Cart error');
        }
    }
}

module.exports = new CartController();
