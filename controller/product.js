const Product = require("../model/product");

exports.products = (req, res, next) => {
    res.json({ message: "All products" });
};

// app.get("/", (req, res, next) => {
//     const error = new Error("Testing error middleware");
//     error.statusCode = 400;
//     next(error);
// });
