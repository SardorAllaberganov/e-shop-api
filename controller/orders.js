const Order = require("../model/orders");
const OrderItem = require("../model/orderItem");
const { populate } = require("dotenv");

exports.getAll = (req, res, next) => {
    Order.find()
        .populate("user", "name")
        .populate({path: "orderItems", populate: {path: "product", populate: "category"}})
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
    Order.findById(req.params.id)
        .populate("user", "name")
        .populate({path: "orderItems", populate: {path: "product", populate: "category"}})
        .then((order) => {
            if (!order) {
                const error = new Error("No order found");
                error.statusCode = 404;
                throw error;
            }
            return res.status(200).json({ message: "One Order", order: order });
        })
        .catch((error) => {
            next(error);
        });
};

exports.createOrder = async (req, res, next) => {
    const orderList = Promise.all(
        req.body.orderItems.map(async (orderItem) => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product,
            });
            newOrderItem = await newOrderItem.save();

            return newOrderItem._id;
        })
    );
    const orderListIds = await orderList;

    const order = new Order({
        orderItems: orderListIds,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: req.body.totalPrice,
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
