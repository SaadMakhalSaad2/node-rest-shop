const express = require("express");
const { response } = require("../../app");
const router = express.Router();

router.get("/", (request, response, next) => {
  response.status(200).json({
    message: "Fetching orders",
  });
});

router.post("/", (request, response, next) => {
  const order = {
    productId: request.body.productId,
    quantity: request.body.quantity,
  };
  response.status(201).json({
    message: "Order created",
    orderCreated: order,
  });
});

router.get("/:orderId", (request, response, next) => {
  response.status(200).json({
    message: "Order details",
    orderId: request.params.orderId,
  });
});

router.delete("/:orderId", (request, response, next) => {
  response.status(200).json({
    message: "Order deleted",
    orderId: request.params.orderId,
  });
});

module.exports = router;
