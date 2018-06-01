const express = require('express');
const router = express.Router();

const orderController = require('../controllers/order');

router.get('/', orderController.orders_get_all_orders);

router.post('/', orderController.orders_create_order);

router.get('/:order_id', orderController.orders_get_order);

router.delete('/:order_id', orderController.orders_delete_order);

module.exports = router;