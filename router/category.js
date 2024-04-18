const express = require("express");
const router = express.Router();
const categoryController = require("../controller/category");
const uploads = require("../middleware/file-upload");

router.get("/", categoryController.categories);
router.post(
    "/createCategory",
    uploads.single("image"),
    categoryController.createCategory
);

router.delete("/:id", categoryController.deleteCategory);
router.get("/:id", categoryController.category);
router.put("/edit/:id", uploads.single("image"), categoryController.editCategory);

module.exports = router;
