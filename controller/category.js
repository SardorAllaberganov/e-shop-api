const Category = require("../model/category");
const clearImage = require("../helper/clearImage");

exports.categories = (req, res, next) => {
    Category.find()
        .then((categories) => {
            if (!categories) {
                const error = new Error("There are no categories found");
                error.statusCode = 422;
                next(error);
                return;
            }

            res.status(200).json({
                products: categories,
                message: "All Categories",
            });
        })
        .catch((error) => {
            next(error);
            return;
        });
};

exports.createCategory = (req, res, next) => {
    const name = req.body.name;
    const color = req.body.color;
    const icon = req.file.path;

    if (!name) {
        const error = new Error("Name is required");
        error.statusCode = 422;
        next(error);
        return;
    }
    if (req.file == undefined) {
        const error = new Error("Please upload a file!");
        error.statusCode = 400;
        next(error);
        return;
    }

    Category.findOne({ name: name })
        .then((categoryDoc) => {
            if (!categoryDoc) {
                const category = new Category({
                    name: name,
                    color: color,
                    icon: icon,
                });
                category
                    .save()
                    .then((result) => {
                        return res.status(201).json({
                            message: "Category saved successfully",
                            category: category,
                        });
                    })
                    .catch((error) => {
                        next(error);
                        return;
                    });
            } else {
                return res
                    .status(422)
                    .json({ message: "Category already exist!" });
            }
        })
        .catch((error) => {
            next(error);
            return;
        });
};

exports.deleteCategory = (req, res, next) => {
    const id = req.params.id.toString();
    let foundCategory;
    Category.findById({ _id: id })
        .then((category) => {
            if (!category) {
                const error = new Error("Category not found to delete!");
                error.statusCode = 422;
                next(error);
                return;
            }
            console.log(category);
            foundCategory = category;
            clearImage(category.icon, (error) => {
                if (error) return next(error);
            });
            return Category.findByIdAndDelete(id);
        })
        .then((result) => {
            return res
                .status(200)
                .json({ message: `Category ${foundCategory.name} is deleted` });
        })
        .catch((error) => {
            next(error);
            return;
        });
};
