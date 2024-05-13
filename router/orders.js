const express = require("express");
const router = express.Router();
const orderController = require("../controller/orders");

router.get("/", orderController.getAll);
router.get("/:id", orderController.getOne);
router.post("/", orderController.createOrder);
router.put("/:id", orderController.editOrder);

module.exports = router;
