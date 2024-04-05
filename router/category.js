const express = require("express");
const router = express.Router();
const categoryController = require("../controller/category");
const uploads = require("../middleware/file-upload");

router.get("/", categoryController.categories);
router.post("/post", uploads.single("icon"), categoryController.createCategory);

module.exports = router;
