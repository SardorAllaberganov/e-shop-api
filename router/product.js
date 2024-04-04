const express = require("express");
const router = express.Router();
const productController = require("../controller/product");

router.get("/", productController.products);
router.post("/post", productController.createProduct);

module.exports = router;
