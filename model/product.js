const mongoose = require("mongoose");
const productSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	richDescription: {
		type: String,
		required: true,
		default: "",
	},
	images: [
		{
			type: String,
		},
	],
	image: {
		type: String,
		default: "",
	},
	brand: {
		type: String,
		default: "",
	},
	price: {
		type: Number,
		default: 0,
	},
	category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Category",
		required: true,
	},
	countInStock: {
		type: Number,
		required: true,
		min: 0,
	},
	rating: {
		type: Number,
		default: 0,
	},
	numReviews: {
		type: Number,
		default: 0,
	},
	isFeatured: {
		type: Boolean,
		default: false,
	},
	dateCreated: {
		type: Date,
		default: Date.now(),
	},
	creator: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
});

module.exports = mongoose.model("Product", productSchema);
