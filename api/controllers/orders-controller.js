const Order = require("../models/order");
const Product = require("../models/product");
const mongoose = require("mongoose");

exports.getAllOrders = (request, response, next) => {
  Order.find()
    .select("product quantity _id")
    .populate("product", "name price")
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
};

exports.newOrder = (request, response, next) => {
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
    .catch((err) => {
      response.status(500).json({
        message: "order not found",
        error: err.message,
      });
    });
};

exports.getOrder = (request, response, next) => {
  Order.findById(request.params.orderId)
    .populate("product")
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
};

exports.deleteOrder = (request, response, next) => {
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
};
