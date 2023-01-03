const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");

router.get("/", (request, response, next) => {
  Order.find()
    .select("product quantity _id")
    .exec()
    .then((docs) => {
      response.status(200).json({
        count: docs.length,
        orders: docs.map((d) => {
          return {
            _id: d._id,
            product: d.product,
            quantity: d.quantity,
            request: {
              type: "GET",
              url: "http://localhost:3000/orders/" + d._id,
            },
          };
        }),
      });
    })
    .catch((error) => {
      response.status(500).json(error);
    });
});

router.post("/", (request, response, next) => {
  Product.findById(request.body.productId)
    .then((product) => {
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: product.quantity,
        product: product._id,
      });

      order
        .save()
        .then((result) => {
          response.status(201).json({
            message: "success",
            orderCreated: order,
          });
        })
        .catch((error) => {
          response.status(500).json({
            error: error,
          });
        });
    })
    .catch(() => {
      response.status(500).json({ message: "order not found" });
    });
});

router.get("/:orderId", (request, response, next) => {
  Order.findById(request.params.orderId)
    .exec()
    .then((order) => {
      if (!order) {
        return response.status(404).json({
          message: "order does not exist",
        });
      }
      response.status(200).json({
        order: order,
      });
    })
    .catch((error) => {
      response.status(500).json({
        error: error,
      });
    });
});

router.delete("/:orderId", (request, response, next) => {
  Order.remove({ _id: request.params.orderId })
    .exec()
    .then((res) => {
      response.status(200).json({
        message: "success",
      });
    })
    .catch((error) => {
      response.status(500).json({
        error: error,
      });
    });
});

module.exports = router;
