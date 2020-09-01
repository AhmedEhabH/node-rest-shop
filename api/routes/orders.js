const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/check-auth");

const OrderController = require("../controllers/orders");

router.get("/", checkAuth, OrderController.ordersGetAll);

router.post("/", checkAuth, OrderController.createOrder);

router.get("/:orderId", checkAuth, OrderController.getOrderById);

router.delete("/:orderId", checkAuth, OrderController.deleteOrderById);

module.exports = router;
