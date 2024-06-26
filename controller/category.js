const Category = require("../model/category");
const clearImage = require("../helper/clearImage");
const mongoose = require("mongoose");

const isValidId = (id) => mongoose.isValidObjectId(id);

exports.categories = (req, res, next) => {
    Category.find()
        .then((categories) => {
            if (!categories) {
                const error = new Error("There are no categories found");
                error.statusCode = 422;
                throw error;
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

exports.createCategory = (req, res, next) => {
    const name = req.body.name;
    const color = req.body.color;
    const icon = req.file.path;

    if (!name || name.length === 0) {
        const error = new Error("Name field is required!");
        error.statusCode = 422;
        throw error;
    }
    if (!req.file) {
        const error = new Error("No image provided!");
        error.statusCode = 422;
        throw error;
    }

    Category.findOne({ name: name }).then((categoryDoc) => {
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
                });
        } else {
            clearImage(icon, (error) => {
                if (error) {
                    const error = new Error("No image icon");
                    error.statusCode = 422;
                    throw error;
                }
            });
            return res.status(422).json({ message: "Category already exist!" });
        }
    });
};

exports.deleteCategory = (req, res, next) => {
    const id = req.params.id;
    let foundCategory;
    const isValid = isValidId(id);
    if (isValid) {
        Category.findById(id)
            .then((category) => {
                if (!category) {
                    const error = new Error("Category not found to delete!");
                    error.statusCode = 422;
                    throw error;
                }
                foundCategory = category;
                return Category.deleteOne({ _id: id })
                    .then(() => {
                        if (category.icon) {
                            clearImage(category.icon, (error) => {
                                if (error) {
                                    const error = new Error("No image icon");
                                    error.statusCode = 422;
                                    throw error;
                                }
                            });
                        }
                    })
                    .catch((error) => {
                        next(error);
                    });
            })
            .then((result) => {
                return res.status(200).json({
                    message: `Category ${foundCategory.name} is deleted`,
                });
            })
            .catch((error) => {
                next(error);
            });
    } else {
        return res.status(400).json({ message: "Not valid category ID" });
    }
};

exports.category = (req, res, next) => {
    const categoryId = req.params.id;
    const isValid = isValidId(categoryId);
    if (isValid) {
        Category.findById(categoryId)
            .then((category) => {
                if (!category) {
                    const error = new Error("Category not found!");
                    error.statusCode = 422;
                    throw error;
                }
                return res
                    .status(200)
                    .json({ message: "Single category", category: category });
            })
            .catch((error) => {
                next(error);
            });
    } else {
        return res.status(400).json({ message: "Not valid category ID" });
    }
};

exports.editCategory = (req, res, next) => {
    const categoryId = req.params.id;
    const isValid = isValidId(categoryId);
    if (isValid) {
        Category.findById(categoryId)
            .then((category) => {
                if (!category) {
                    const error = new Error("Category not found!");
                    error.statusCode = 422;
                    throw error;
                }
                if (req.file) {
                    const icon = req.file.path;
                    if (icon !== category.icon) {
                        clearImage(category.icon, (error) => {
                            if (error) {
                                const error = new Error("No image icon");
                                error.statusCode = 422;
                                throw error;
                            }
                        });
                    }
                    category.icon = icon;
                }
                const name = req.body.name;
                const color = req.body.color;

                category.name = name;
                category.color = color;

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
                    });
            })
            .catch((error) => {
                next(error);
            });
    } else {
        return res.status(400).json({ message: "Not valid category ID" });
    }
};
