// src/routes/checkout.js
const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const requireLogin = require('../mdlw/requireLogin');
const requireLoginPage = require('../mdlw/requireLoginPage');

router.get('/', requireLoginPage, checkoutController.renderCheckoutPage);
router.post('/momo', requireLogin, checkoutController.createMomoPayment);
router.post('/confirm-payment', requireLogin, checkoutController.confirmPayment);

module.exports = router;
