const express = require("express");
const router = express.Router();
const productController = require("../controller/product");

router.get("/", productController.products);

module.exports = router;
