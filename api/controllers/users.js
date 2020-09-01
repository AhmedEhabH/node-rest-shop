const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .exec()
        .then((user) => {
            if (user) {
                res.status(409).json({
                    message: "Mail exists",
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err,
                        });
                    } else {
                        const user = new User({
                            _id: mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash,
                        });

                        user.save()
                            .then((result) => {
                                console.log(result);
                                res.status(201).json({
                                    message: "User created",
                                });
                            })
                            .catch((err) => {
                                console.log(err);
                                res.status(500).json({
                                    error: err,
                                });
                            });
                    }
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

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .exec()
        .then((user) => {
            console.log(user);
            if (!user) {
                console.log("I don'y now user");
                return res.status(401).json({
                    message: "Auth failed",
                });
            }
            bcrypt.compare(
                req.body.password,
                user.password,
                (err, response) => {
                    if (err) {
                        return res.status(401).json({
                            message: "Auth failed",
                        });
                    }
                    if (response) {
                        const token = jwt.sign(
                            {
                                email: user.email,
                                userId: user._id,
                            },
                            process.env.JWT_KEY,
                            {
                                expiresIn: "3h",
                            }
                        );
                        return res.status(200).json({
                            message: "Auth successful",
                            token: token,
                            expiresIn: "3h"
                        });
                    }
                    return res.status(401).json({
                        message: "Auth failed",
                    });
                }
            );
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({
                error: err,
            });
        });
};

exports.deleteUserById = (req, res, next) => {
    User.deleteOne({ _id: req.params.userId })
        .exec()
        .then((result) => {
            console.log(result);
            res.status(200).json({
                message: "User deleted",
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err,
            });
        });
};
