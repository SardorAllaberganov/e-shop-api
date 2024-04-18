const Product = require("../model/product");
const Category = require("../model/category");
const clearImage = require("../helper/clearImage");

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
    const imageFile = req.files["image"][0];
    const imagesFiles = req.files["images"];
    const imagesPaths = imagesFiles.map((imagePath) => {
        return imagePath.path;
    });

    if (!imageFile || !imagesFiles) {
        const error = new Error("No image provided");
        error.statusCode = 422;
        throw error;
    }

    Category.findById(req.body.category)
        .then((categoryDoc) => {
            if (!categoryDoc) {
                clearImage(imageFile.path, (error) => {
                    if (error) {
                        const error = new Error("No image icon");
                        error.statusCode = 422;
                        throw error;
                    }
                });
                imagesPaths.forEach((imagePath) => {
                    clearImage(imagePath, (error) => {
                        if (error) {
                            const error = new Error("No image icon");
                            error.statusCode = 422;
                            throw error;
                        }
                    });
                });
                const error = new Error("Category not found");
                error.statusCode = 404;
                throw error;
            } else {
                const product = new Product({
                    name: req.body.name,
                    description: req.body.description,
                    richDescription: req.body.richDescription,
                    image: imageFile.path,
                    images: imagesPaths,
                    brand: req.body.brand,
                    price: req.body.price,
                    category: req.body.category,
                    countInStock: req.body.countInStock,
                    rating: req.body.rating,
                    numReviews: req.body.numReviews,
                    isFeatured: req.body.isFeatured,
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
            }
        })
        .catch((error) => next(error));
};
// app.get("/", (req, res, next) => {
//     const error = new Error("Testing error middleware");
//     error.statusCode = 400;
//     next(error);
// });
