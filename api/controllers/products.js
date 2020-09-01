const mongoose = require("mongoose");
const fs = require("fs");

const Product = require("../models/product");

exports.getAllProducts = (req, res, next) => {
    Product.find()
        .select("_id name price productImage")
        .exec()
        .then((result) => {
            console.log(result);
            const response = {
                count: result.length,
                products: result.map((doc) => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        productImage: doc.productImage,
                        request: {
                            type: "GET",
                            url: `http://${process.env.IP || "localhost"}:${
                                process.env.PORT || 3000
                            }/products/${doc._id}`,
                        },
                    };
                }),
            };
            res.status(200).json(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};

exports.createProduct = (req, res, next) => {
    console.log(req.file);
    const product = new Product({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path,
    });
    product
        .save()
        .then((result) => {
            console.log(result);
            res.status(201).json({
                message: "Created product successfully",
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    productImage: result.productImage,
                    _id: result._id,
                    request: {
                        type: "GET",
                        url: `http://${process.env.IP || "localhost"}:${
                            process.env.PORT || 3000
                        }/products/${result._id}`,
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

exports.getProductById = (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select("_id name price productImage")
        .exec()
        .then((result) => {
            console.log("Result from database");
            console.log(result);
            if (result) {
                res.status(200).json({
                    product: result,
                    request: {
                        type: "GET",
                        description: "Get all products",
                        url: `http://${process.env.IP || "localhost"}:${
                            process.env.PORT || 3000
                        }/products/`,
                    },
                });
            } else {
                res.status(404).json({
                    message: "No valid entry fond for provided ID",
                });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err,
            });
        });
};

exports.updateProductById = (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.updateOne({ _id: id }, { $set: updateOps })
        .exec()
        .then((result) => {
            console.log(result);
            res.status(200).json({
                message: "Product updated",
                request: {
                    type: "GET",
                    url: `http://${process.env.IP || "localhost"}:${
                        process.env.PORT || 3000
                    }/products/${id}`,
                },
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};

exports.deleteProductById = (req, res, next) => {
    const id = req.params.productId;
    Product.findById(req.params.productId)
        .exec()
        .then((product) => {
            console.log(product);
            try {
                Product.deleteOne({ _id: id })
                    .exec()
                    .then((result) => {
                        console.log(result);
                        if (product && product.productImage) {
                            fs.unlinkSync(product.productImage);
                        }
                        res.status(200).json({
                            message: "Product deleted",
                            request: {
                                type: "POST",
                                url: `http://${process.env.IP || "localhost"}:${
                                    process.env.PORT || 3000
                                }/products/`,
                                body: {
                                    name: {
                                        type: "String",
                                        required: true,
                                    },
                                    price: {
                                        type: "Number",
                                        required: true,
                                    },
                                },
                            },
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).json({ error: err });
                    });
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: err });
            }
        });
};
