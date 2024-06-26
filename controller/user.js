const User = require("../model/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mongoose = require("mongoose");
const isValidId = (id) => mongoose.isValidObjectId(id);

exports.getUsers = (req, res, next) => {
    User.find()
        .select("-passwordHash")
        .then((users) => {
            return res.status(200).json({ message: "All users", users: users });
        })
        .catch((error) => {
            next(error);
        });
};

exports.createUsers = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed");
        error.data = errors.array()[0].msg;
        error.statusCode = 422;
        throw error;
    }
    const password = req.body.password;
    bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                passwordHash: hashedPassword,
                phone: req.body.phone,
                isAdmin: req.body.isAdmin,
                street: req.body.street,
                apartment: req.body.apartment,
                zip: req.body.zip,
                city: req.body.city,
                country: req.body.country,
            });

            return user
                .save()
                .then((result) => {
                    const userWithoutPassword = result.toObject();
                    delete userWithoutPassword.passwordHash;
                    return res.status(201).json({
                        message: "User created successfully!",
                        user: userWithoutPassword,
                    });
                })
                .catch((error) => {
                    next(error);
                });
        })
        .catch((error) => {
            next(error);
        });
};

exports.getUser = (req, res, next) => {
    const userId = req.params.id;
    User.findById(userId)
        .select("-passwordHash")
        .then((user) => {
            if (!user) {
                const error = new Error("User not found!");
                error.statusCode = 404;
                throw error;
            }
            return res.status(200).json({ message: "User found", user: user });
        })
        .catch((error) => {
            next(error);
        });
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error("Validation failed");
        error.data = errors.array()[0].msg;
        error.statusCode = 422;
        throw error;
    }

    User.findOne({ email: email })
        .then((user) => {
            if (!user) {
                const error = new Error("User not found");
                error.statusCode = 404;
                throw error;
            }
            bcrypt
                .compare(password, user.passwordHash)
                .then((isEqual) => {
                    if (!isEqual) {
                        const error = new Error("Wrong password");
                        error.statusCode = 401;
                        throw error;
                    }
                    const token = jwt.sign(
                        {
                            user: {
                                id: user._id,
                                name: user.name,
                                isAdmin: user.isAdmin,
                                email: user.email,
                            },
                        },
                        process.env.JWT_SECRET,
                        {
                            expiresIn: "1d",
                        }
                    );
                    return res.status(200).json({
                        message: "Login successful",
                        user: {
                            id: user._id,
                            name: user.name,
                            email: user.email,
                        },
                        token,
                    });
                })
                .catch((error) => {
                    next(error);
                });
        })
        .catch((error) => {
            next(error);
        });
};

exports.register = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed");
        error.data = errors.array()[0].msg;
        error.statusCode = 422;
        throw error;
    }
    const password = req.body.password;
    bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                passwordHash: hashedPassword,
                phone: req.body.phone,
                street: req.body.street,
                apartment: req.body.apartment,
                zip: req.body.zip,
                city: req.body.city,
                country: req.body.country,
            });

            return user
                .save()
                .then((result) => {
                    const userWithoutPassword = result.toObject();
                    delete userWithoutPassword.passwordHash;
                    return res.status(201).json({
                        message: "You registered successfully!",
                        user: userWithoutPassword,
                    });
                })
                .catch((error) => {
                    next(error);
                });
        })
        .catch((error) => {
            next(error);
        });
};

exports.deleteUser = (req, res, next) => {
    const id = req.params.id;

    const isValid = isValidId(id);
    if (isValid) {
        User.findById(id)
            .then((user) => {
                if (!user) {
                    const error = new Error("User not found to delete!");
                    error.statusCode = 422;
                    throw error;
                }

                return User.deleteOne({ _id: id });
            })
            .then((result) => {
                return res.status(200).json({
                    message: `User deleted`,
                });
            })
            .catch((error) => {
                next(error);
            });
    }
};
