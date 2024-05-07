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
            .not()
            .isEmpty()
            .withMessage("Email cannot be an empty")
            .custom(async (value, { req }) => {
                const result = await User.findOne({ email: value });
                if (result) {
                    return await Promise.reject("Email address already exists");
                }
            })
            .normalizeEmail(),
    ],
    userController.createUsers
);

router.post(
    "/register",
    [
        body("email")
            .isEmail()
            .not()
            .isEmpty()
            .withMessage("Email cannot be an empty")
            .custom(async (value, { req }) => {
                const result = await User.findOne({ email: value });
                if (result) {
                    return await Promise.reject("Email address already exists");
                }
            })
            .normalizeEmail(),
    ],
    userController.register
);

router.get("/:id", userController.getUser);
router.post(
    "/login",
    [
        body("email")
            .isEmail()
            .not()
            .isEmpty()
            .withMessage("Email cannot be an empty")
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then((user) => {
                    if (!user) {
                        return Promise.reject("Email address not found");
                    }
                });
            })
            .normalizeEmail(),
        body("password")
            .not()
            .isEmpty()
            .withMessage("Password is required")
            .isLength({ min: 5 }),
    ],
    userController.login
);

module.exports = router;
