const express = require("express");
const router = express.Router();
const categoryController = require("../controller/category");
const uploads = require("../middleware/file-upload");

router.get("/", categoryController.categories);
router.post(
    "/createCategory",
    uploads.single("icon"),
    categoryController.createCategory
);

router.delete("/:name", categoryController.deleteCategory);

module.exports = router;
