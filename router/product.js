const express = require("express");
const router = express.Router();
const productController = require("../controller/product");
const uploads = require("../middleware/file-upload");

router.get("/", productController.products);
router.post("/post", uploads.single("image"), productController.createProduct);

module.exports = router;
