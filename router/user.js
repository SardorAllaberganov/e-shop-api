const express = require("express");
const router = express.Router();
const userController = require("../controller/user");
const { body } = require("express-validator");
const User = require("../model/user");

router.get("/", userController.getUsers);
router.post(
	"/create",
	[
		body("email")
			.isEmail()
			.notEmpty()
			.withMessage("Email cannot be an empty")
			.custom()
			.normalizeEmail(async (value, { req }) => {
				const result = await User.findOne({ email: value });
				if (result) {
					return await Promise.reject("Email address already exists");
				}
			}),
	],
	userController.createUsers
);

module.exports = router;
