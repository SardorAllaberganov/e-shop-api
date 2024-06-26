const Product = require("../model/product");
const Category = require("../model/category");
const clearImage = require("../helper/clearImage");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const isValidId = (id) => mongoose.isValidObjectId(id);

function isAuthenticated(req) {
	const token = req.headers.authorization.split(" ")[1];
	const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
	if (decodedToken) {
		req.user = decodedToken;
		return true;
	}
	return false;
}

function clearImageFunction(imageFile, imagesPaths) {
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
}

exports.products = (req, res, next) => {
	const currentPage = req.query.page || 1;
	const perPage = 48;
	let totalItems;

	let filter = {};

	if (req.query.categories) {
		filter = { category: req.query.categories.split(",") };
	}

	Product.find()
		.countDocuments()
		.then((count) => {
			totalItems = count;
			return Product.find(filter)
				.skip((currentPage - 1) * perPage)
				.limit(perPage)
				.populate("category");
		})
		.then((products) => {
			res.status(200).json({
				products: products,
				totalItems: filter ? products.length : totalItems,
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
	const imagesPaths =
		imagesFiles &&
		imagesFiles.map((imagePath) => {
			return imagePath.path;
		});

	if (!imageFile || !imagesFiles) {
		const error = new Error("No image provided");
		error.statusCode = 422;
		throw error;
	}

	if (isAuthenticated(req)) {
		const creator = req.user.user.id;
		const isValid = isValidId(req.body.category);
		if (isValid) {
			Category.findById(req.body.category)
				.then((categoryDoc) => {
					if (!categoryDoc) {
						clearImageFunction(imageFile, imagesPaths);
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
							creator: creator,
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
		} else {
			clearImageFunction(imageFile, imagesPaths);
			return res.status(400).json({ message: "Not valid category ID" });
		}
	}
};

exports.product = (req, res, next) => {
	const id = req.params.id;
	const isValid = isValidId(id);
	if (isValid) {
		Product.findById(id)
			.populate("category")
			.then((product) => {
				if (!product) {
					const error = new Error("Product not found");
					error.statusCode = 404;
					throw error;
				}
				return res
					.status(200)
					.json({ message: "Product found", product: product });
			})
			.catch((error) => {
				next(error);
			});
	} else {
		return res.status(400).json({ message: "Not valid ID" });
	}
};

exports.editProduct = async (req, res, next) => {
	const imageFile = req.files["image"][0];
	const imagesFiles = req.files["images"];
	const imagesPaths =
		imagesFiles &&
		imagesFiles.map((imagePath) => {
			return imagePath.path;
		});

	if (!imageFile || !imagesFiles) {
		const error = new Error("No image provided");
		error.statusCode = 422;
		throw error;
	}
	if (isAuthenticated(req)) {
		const isAdmin = req.user.user.isAdmin;
		const userId = req.user.user.id.toString();
		const creator = await Product.findById(req.params.id);
		if (userId === creator.creator.toString() || isAdmin) {
			const isValid = isValidId(req.body.category);

			if (isValid) {
				Category.findById(req.body.category).then((categoryDoc) => {
					if (!categoryDoc) {
						clearImageFunction(imageFile, imagesPaths);
						const error = new Error("Category not found");
						error.statusCode = 404;
						throw error;
					} else {
						let updatedProduct;
						Product.findById(req.params.id)
							.then((product) => {
								if (!product) {
									clearImageFunction(imageFile, imagesPaths);
									const error = new Error(
										"Product not found"
									);
									error.statusCode = 404;
									throw error;
								} else {
									product.name = req.body.name;
									product.description = req.body.description;
									product.richDescription =
										req.body.richDescription;
									if (product.image !== imageFile.path)
										clearImage(product.image, (error) => {
											if (error) {
												const error = new Error(
													"No image icon"
												);
												error.statusCode = 422;
												throw error;
											}
										});
									if (
										JSON.stringify(product.images) !==
										JSON.stringify(imagesPaths)
									) {
										product.images.forEach((imagePath) => {
											clearImage(imagePath, (error) => {
												if (error) {
													const error = new Error(
														"No image icon"
													);
													error.statusCode = 422;
													throw error;
												}
											});
										});
									}
									product.image = imageFile.path;
									product.images = imagesPaths;
									product.brand = req.body.brand;
									product.price = req.body.price;
									product.category = req.body.category;
									product.countInStock =
										req.body.countInStock;
									product.rating = req.body.rating;
									product.numReviews = req.body.numReviews;
									product.isFeatured = req.body.isFeatured;
									updatedProduct = product;
									return product.save();
								}
							})
							.then((result) => {
								return res.status(200).json({
									message: "Product Updated successfully!",
									product: updatedProduct,
								});
							})
							.catch((error) => {
								next(error);
							});
					}
				});
			} else {
				clearImageFunction(imageFile, imagesPaths);
				return res
					.status(400)
					.json({ message: "Not valid category ID" });
			}
		} else {
			clearImageFunction(imageFile, imagesPaths);
			return res.status(403).json({ message: "Access Denied" });
		}
	} else {
		clearImageFunction(imageFile, imagesPaths);
		return res.status(401).json({ message: "Access Denied" });
	}
};

exports.deleteProduct = async (req, res, next) => {
	const id = req.params.id;
	if (isAuthenticated(req)) {
        const isAdmin = req.user.user.isAdmin;
		const userId = req.user.user.id.toString();
		const creator = await Product.findById(id); 
		if (userId === creator.creator.toString() || isAdmin) {
			const isValid = isValidId(id);
			if (isValid) {
				Product.findById(id)
					.then((product) => {
						if (!product) {
							const error = new Error(
								"Product not found to delete!"
							);
							error.statusCode = 422;
							throw error;
						}

						return Product.deleteOne({ _id: id })
							.then(() => {
								if (product.image) {
                                    clearImage(product.image, (error) => {
                                        if (error) {
                                            const error = new Error("No image icon");
                                            error.statusCode = 422;
                                            throw error;
                                        }
                                    });
                                }
                                if (product.images) {
                                    product.images.forEach((imagePath) => {
                                        clearImage(imagePath, (error) => {
                                            if (error) {
                                                const error = new Error(
                                                    "No image icon"
                                                );
                                                error.statusCode = 422;
                                                throw error;
                                            }
                                        });
                                    });
                                }
							})
							.catch((error) => {
								next(error);
							});
					})
					.then((result) => {
						return res.status(200).json({
							message: `Product deleted`,
						});
					})
					.catch((error) => {
						next(error);
					});
			}
	} else {
		return res.status(401).json({ message: "Access Denied" });
	}
} else {
    return res.status(401).json({ message: "Unauthorized" });
}
};

exports.getFeatured = (req, res, next) => {
	Product.find({ isFeatured: true })
		.then((products) => {
			if (!products) {
				const error = new Error(
					"There is no featured Products in Database"
				);
				error.statusCode = 422;
				throw error;
			}
			return res
				.status(200)
				.json({ message: "Featured Products", products: products });
		})
		.catch((error) => {
			next(error);
		});
};

exports.searchProduct = (req, res, next) => {
	const query = req.query.name;

	Product.find({ name: { $regex: query, $options: "i" } })
		.then((products) => {
			if (!products) {
				const error = new Error("There is no such Products");
				error.statusCode = 422;
				throw error;
			}
			return res.json({ message: "Products", products: products });
		})
		.catch((error) => {
			next(error);
		});
};

exports.getFiltered = async (req, res, next) => {
	const { categoryName, minPrice, maxPrice, brand } = req.query;
	let filter = {};

	const category = await Category.findOne({ name: categoryName });
	if (!category) {
		const error = new Error("There is no such category");
		error.statusCode = 422;
		throw error;
	}
	filter.category = category._id;

	if (brand) {
		filter.brand = { $regex: brand.trim(), $options: "i" };
	}
	if (minPrice && maxPrice) {
		filter.price = { $gte: minPrice, $lte: maxPrice };
	} else if (minPrice) {
		filter.price = { $gte: minPrice };
	} else if (maxPrice) {
		filter.price = { $lte: maxPrice };
	}

	Product.find(filter)
		.then((products) => {
			if (!products) {
				const error = new Error("There is no such Products");
				error.statusCode = 422;
				throw error;
			}
			return res
				.status(200)
				.json({ message: "Filtered Products", products: products });
		})
		.catch((error) => {
			next(error);
		});
};

// exports.filterByCategory = (req, res, next) => {
//     const category = req.query.category;
//     if (category) {
//         Product.find({ category: [category.split(",")] })
//             .then((products) => {
//                 if (!products) {
//                     const error = new Error(
//                         "There is no products with this Category"
//                     );
//                     error.statusCode = 422;
//                     throw error;
//                 }
//                 return res
//                     .status(200)
//                     .json({ message: "Category Products", products: products });
//             })
//             .catch((error) => {
//                 next(error);
//             });
//     }
// };
