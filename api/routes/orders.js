const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const ordersCtrl = require("../controllers/orders-controller");

router.get("/", checkAuth, ordersCtrl.getAllOrders);

router.post("/", checkAuth, ordersCtrl.newOrder);

router.get("/:orderId", checkAuth, ordersCtrl.getOrder);

router.delete("/:orderId", checkAuth, ordersCtrl.deleteOrder);

module.exports = router;
