const Category = require("../model/category");

exports.categories = (req, res, next) => {
    Category.find()
        .then((categories) => {
            if (!categories) {
                const error = new Error("There are no categories found");
                error.statusCode = 422;
                next(error);
            }

            res.status(200).json({
                products: categories,
                message: "All Categories",
            });
        })
        .catch((error) => {
            next(error);
        });
};
