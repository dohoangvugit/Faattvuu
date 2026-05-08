// src/controllers/checkoutController.js
const cartModel = require('../models/cartModel');
const orderModel = require('../models/orderModel');
const crypto = require('crypto');
const axios = require('axios');

class CheckoutController {
    async renderCheckoutPage(req, res) {
        try {
            const userId = req.user.id;
            const cart = await cartModel.getOrCreateCart(userId);
            const items = await cartModel.getCartItems(cart.id);

            let total = 0;
            items.forEach(
                (item) => (total += item.products.price * item.quantity),
            );

            res.render('checkout', { items, total });
        } catch (err) {
            console.error(err);
            res.status(500).send('Lỗi checkout page');
        }
    }

    async createMomoPayment(req, res) {
        try {
            const userId = req.user.id;
            const cart = await cartModel.getOrCreateCart(userId);
            const items = await cartModel.getCartItems(cart.id);

            if (!items.length)
                return res.status(400).json({ error: 'Cart trống' });

            let total = 0;
            items.forEach(
                (item) => (total += item.products.price * item.quantity),
            );

            // Tạo order
            const order = await orderModel.createOrder(userId, total);

            for (const item of items) {
                await orderModel.addItem(
                    order.id,
                    item.products.id,
                    item.quantity,
                    item.products.price,
                );
            }

            // Tạo payload Momo QR
            const partnerCode = 'MOMOQEKB20260219';
            const accessKey = 'uI8zatzQRY42xUBD';
            const secretKey = 'wZdtvMhqdDgSRAYTbxJwcTVbXCvzl1zF';
            const requestId = `${Date.now()}`;
            const orderId = `${order.id}`;
            const amount = `${total}`;
            const orderInfo = 'Thanh toán đơn hàng';
            const returnUrl = `https://bandonoithat.onrender.com/checkout/success/${order.id}`;
            const notifyUrl =
                'https://bandonoithat.onrender.com/api/checkout/ipn';
            const extraData = '';

            const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&notifyUrl=${notifyUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&returnUrl=${returnUrl}&requestId=${requestId}&requestType=captureWallet`;

            const signature = crypto
                .createHmac('sha256', secretKey)
                .update(rawSignature)
                .digest('hex');

            const response = await axios.post(
                'https://payment.momo.vn/v2/gateway/api/create',
                {
                    partnerCode,
                    accessKey,
                    requestId,
                    amount,
                    orderId,
                    orderInfo,
                    returnUrl,
                    notifyUrl,
                    extraData,
                    requestType: 'captureWallet',
                    signature,
                },
            );

            res.json({ qrUrl: response.data.qrCodeUrl, orderId: order.id });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }

    async confirmPayment(req, res) {
        try {
            const userId = req.user.id;
            const cart = await cartModel.getOrCreateCart(userId);
            const items = await cartModel.getCartItems(cart.id);

            if (!items.length)
                return res.status(400).json({ error: 'Cart trống' });

            let total = 0;
            items.forEach(
                (item) => (total += item.products.price * item.quantity),
            );

            // Tạo order
            const order = await orderModel.createOrder(userId, total);

            // Thêm các items vào order
            for (const item of items) {
                await orderModel.addItem(
                    order.id,
                    item.products.id,
                    item.quantity,
                    item.products.price,
                );
            }

            // Cập nhật status thành 'completed' (đã thanh toán)
            await orderModel.updateStatus(order.id, 'completed');

            // Xóa các items trong giỏ hàng
            await cartModel.clearCart(cart.id);

            res.json({ success: true, orderId: order.id });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new CheckoutController();
