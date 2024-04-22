const User = require("../model/user");
const { validationResult } = require("express-validator");

exports.getUsers = (req, res, next) => {
	User.find()
		.then((users) => {
			return res.status(200).json({ message: "All users", users: users });
		})
		.catch((error) => {
			next(error);
		});
};

exports.createUsers = (req, res, next) => {};
