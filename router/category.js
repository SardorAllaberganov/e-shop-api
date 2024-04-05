const express = require("express");
const router = express.Router();
const categoryController = require("../controller/category");

router.get("/", categoryController.categories);
// router.post("/post", categoryController.createProduct);

module.exports = router;
