const express = require("express");
const { response } = require("../../app");
const router = express.Router();
const Product = require("../models/product");
const mongoose = require("mongoose");
const { update } = require("../models/product");

router.get("/", (request, response, next) => {
  Product.find()
    .exec()
    .then((docs) => {
      console.log(docs);
      response.status(200).json({
        message: "success",
        products: docs,
      });
    })
    .catch((error) => {
      console.log(error);
      response.status(500).json({
        message: "failed",
        error: error,
      });
    });
});

router.post("/", (request, response, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: request.body.name,
    price: request.body.price,
  });

  product
    .save()
    .then((result) => {
      console.log("saved: " + result);
      response.status(201).json({
        message: "success",
        createdProduct: result,
      });
    })
    .catch((error) => {
      console.log("error saving: " + error);
      response.status(500).json({
        error: error,
      });
    });
});

router.get("/:productId", (request, response, next) => {
  const id = request.params.productId;
  Product.findById(id)
    .exec()
    .then((doc) => {
      response.status(200).json(doc);
    })
    .catch((error) => {
      response.status(500).json({
        error: error,
      });
    });
});

router.patch("/:productId", (request, response, next) => {
  const id = request.params.productId;

  const updateOps = {};
  for (const ops of request.body) {
    updateOps[ops.propName] = ops.value;
  }

  console.log("updating id: " + id);
  Product.updateOne(
    { _id: id },
    {
      $set: updateOps,
    }
  )
    .exec()
    .then((res) => {
      console.log(res);
      response.status(200).json(res);
    })
    .catch((error) => {
      console.log(error);
      response.status(500).json(error);
    });
});

router.delete("/:productId", (request, response, next) => {
  const id = request.params.productId;
  Product.remove({ _id: id })
    .exec()
    .then((res) => {
      response.status(200).json(res);
    })
    .catch((error) => {
      response.status(500).json({ error: error });
    });
});

module.exports = router;
