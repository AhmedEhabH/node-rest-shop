const mongoose = require("mongoose");

const Order = require("../models/order");
const Product = require("../models/product");

exports.ordersGetAll = (req, res, next) => {
    Order.find()
        .select("_id product quantity")
        .populate("product", "name price")
        .exec()
        .then((docs) => {
            console.log(docs);
            res.status(200).json({
                count: docs.length,
                orders: docs.map((doc) => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: "GET",
                            url: `http://${process.env.IP || "localhost"}:${
                                process.env.PORT || "3000"
                            }/orders/${doc._id}`,
                        },
                    };
                }),
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err,
            });
        });
};

exports.createOrder = (req, res, next) => {
    Product.findById(req.body.productId)
        .exec()
        .then((product) => {
            if (!product) {
                return res.status(404).json({
                    message: "Product not found",
                });
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                product: req.body.productId,
                quantity: req.body.quantity,
            });
            return order
                .save()
                .then((result) => {
                    console.log(result);
                    res.status(201).json({
                        message: "Order stored",
                        createdOrder: {
                            _id: result._id,
                            product: result.product,
                            quantity: result.quantity,
                        },
                        request: {
                            type: "GET",
                            url: `http://${process.env.IP || "localhost"}:${
                                process.env.PORT || "3000"
                            }/orders/${result._id}`,
                        },
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        error: err,
                    });
                });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                message: "Product not found",
                error: err,
            });
        });
};

exports.getOrderById = (req, res, next) => {
    Order.findById(req.params.orderId)
        .populate("product")
        .exec()
        .then((order) => {
            console.log(order);
            if (!order) {
                return res.status(404).json({
                    message: "Order not found",
                });
            }
            res.status(200).json({
                order: order,
                request: {
                    type: "GET",
                    message: "Get all orders",
                    url: `http://${process.env.IP || "localhost"}:${
                        process.env.PORT || "3000"
                    }/orders/`,
                },
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err,
            });
        });
};

exports.deleteOrderById = (req, res, next) => {
    Order.deleteOne({ _id: req.params.orderId })
        .exec()
        .then((result) => {
            console.log(result);
            res.status(200).json({
                message: "Order deleted",
                request: {
                    type: "POST",
                    url: `http://${process.env.IP || "localhost"}:${
                        process.env.PORT || "3000"
                    }/orders/`,
                    body: {
                        product: {
                            type: "ID",
                            required: true,
                        },
                        quantity: {
                            type: "Number",
                        },
                    },
                },
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err,
            });
        });
};
