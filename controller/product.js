const Product = require("../model/product");

exports.products = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 48;
    let totalItems;
    Product.find()
        .countDocuments()
        .then((count) => {
            totalItems = count;
            return Product.find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then((products) => {
            res.status(200).json({
                products: products,
                totalItems: totalItems,
                message: "All Products",
            });
        })
        .catch((error) => {
            next(error);
        });
};

exports.createProduct = (req, res, next) => {
    if (!req.file) {
        const error = new Error("No image provided");
        error.statusCode = 422;
        next(error);
    }
    console.log(req.file);
    const name = req.body.name;
    const image = req.file.path;
    const countInStock = req.body.countInStock;
    const product = new Product({
        name: name,
        image: image,
        countInStock: countInStock,
    });
    product
        .save()
        .then((result) => {
            res.status(201).json({
                message: "Product created successfully!!!",
                product: product,
            });
        })
        .catch((error) => {
            next(error);
        });
};
// app.get("/", (req, res, next) => {
//     const error = new Error("Testing error middleware");
//     error.statusCode = 400;
//     next(error);
// });
