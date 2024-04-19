const express = require("express");
const router = express.Router();
const productController = require("../controller/product");
const uploads = require("../middleware/file-upload");

router.get("/", productController.products);
router.get("/:id", productController.product);
router.put(
    "/:id",
    uploads.fields([
        { name: "image", maxCount: 1 },
        { name: "images", maxCount: 10 },
    ]),
    productController.editProduct
);
router.post(
    "/create",
    uploads.fields([
        { name: "image", maxCount: 1 },
        { name: "images", maxCount: 10 },
    ]),
    productController.createProduct
);

module.exports = router;
