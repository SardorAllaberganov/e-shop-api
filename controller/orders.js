const Order = require("../model/orders");
const OrderItem = require("../model/orderItem");
const mongoose = require("mongoose");

const isValidId = (id) => mongoose.isValidObjectId(id);

exports.getAll = (req, res, next) => {
    Order.find()
        .populate("user", "name")
        .populate({
            path: "orderItems",
            populate: { path: "product", populate: "category" },
        })
        .sort({ dateOrdered: -1 })
        .then((ordersList) => {
            if (!ordersList) {
                const error = new Error("No orders found");
                error.statusCode = 404;
                throw error;
            }
            return res
                .status(200)
                .json({ message: "All orders", ordersList: ordersList });
        })
        .catch((error) => {
            next(error);
        });
};
exports.getOne = (req, res, next) => {
    const orderId = req.params.id;
    const isValid = isValidId(orderId);
    if (isValid) {
        Order.findById(orderId)
            .populate("user", "name")
            .populate({
                path: "orderItems",
                populate: { path: "product", populate: "category" },
            })
            .then((order) => {
                if (!order) {
                    const error = new Error("No order found");
                    error.statusCode = 404;
                    throw error;
                }
                return res
                    .status(200)
                    .json({ message: "One Order", order: order });
            })
            .catch((error) => {
                next(error);
            });
    } else {
        return res.status(400).json({ message: "Not valid ID" });
    }
};

exports.createOrder = async (req, res, next) => {
    const orderList = await Promise.all(
        req.body.orderItems.map(async (orderItem) => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product,
            });
            newOrderItem = await newOrderItem.save();

            return newOrderItem._id;
        })
    );
    let sumTotalPrice = 0;
    await Promise.all(
        orderList.map(async (orderItemId) => {
            const orderItem = await OrderItem.findById(orderItemId).populate(
                "product",
                "price"
            );
            const totalPrice = orderItem.product.price * orderItem.quantity;
            sumTotalPrice += totalPrice;
        })
    );

    const order = new Order({
        orderItems: orderList,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: sumTotalPrice,
        user: req.body.userId,
    });
    return order
        .save()
        .then((result) => {
            return res
                .status(201)
                .json({ message: "Order created", order: result });
        })
        .catch((error) => {
            next(error);
        });
};

exports.editOrder = (req, res, next) => {
    const orderId = req.params.id;
    const isValid = isValidId(orderId);
    if (isValid) {
        Order.findById(orderId)
            .then((order) => {
                if (!order) {
                    const error = new Error("Order not found!");
                    error.statusCode = 422;
                    throw error;
                }

                order.status = req.body.status;

                order
                    .save()
                    .then((result) => {
                        return res.status(201).json({
                            message: "Order saved successfully",
                            order: order,
                        });
                    })
                    .catch((error) => {
                        next(error);
                    });
            })
            .catch((error) => {
                next(error);
            });
    } else {
        return res.status(400).json({ message: "Not valid ID" });
    }
};

exports.deleteOrder = (req, res, next) => {
    const orderId = req.params.id;
    const isValid = isValidId(orderId);
    if (isValid) {
        Order.findByIdAndDelete(orderId)
            .then((order) => {
                if (!order) {
                    const error = new Error("Order not found to delete!");
                    error.statusCode = 422;
                    throw error;
                }
                return Promise.all(
                    order.orderItems.map((orderItem) => {
                        return OrderItem.findOneAndDelete({
                            _id: orderItem._id,
                        });
                    })
                );
            })
            .then(() => {
                return res.status(200).json({
                    message: `Order is deleted`,
                });
            })
            .catch((error) => {
                next(error);
            });
    } else {
        return res.status(400).json({ message: "Not valid ID" });
    }
};

exports.getTotalSales = (req, res, next) => {
    Order.aggregate([
        {
            $group: {
                _id: null,
                totalSales: { $sum: "$totalPrice" },
            },
        },
    ])
        .then((sales) => {
            if (!sales) {
                const error = new Error("No sales found");
                error.statusCode = 404;
                throw error;
            }
            return res.status(200).json({
                message: "Total sales",
                totalSales: sales[0].totalSales.toLocaleString("fi-FI"),
            });
        })
        .catch((error) => {
            next(error);
        });
};
