const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const mongoose = require("mongoose");

router.get("/", (request, response, next) => {
  Product.find()
    .select("name price _id")
    .exec()
    .then((docs) => {
      const res = {
        count: docs.length,
        products: docs.map((doc) => {
          return {
            name: doc.name,
            price: doc.price,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/products/" + doc._id,
            },
          };
        }),
      };
      response.status(200).json(res);
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
        createdProduct: {
          name: result.name,
          _id: result.name,
          price: result.price,
          request: {
            type: "GET",
            url: "http://localhost:3000/products/" + result._id,
          },
        },
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
    .select("name price _id")
    .exec()
    .then((doc) => {
      response.status(200).json({
        product: doc,
        request: {
          type: "GET",
          description: "Get all products",
          url: "http://localhost:3000/products",
        },
      });
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
      response.status(200).json({
        message: "success",
        request: {
          type: "GET",
          url: "http://localhost:3000/products/" + id,
        },
      });
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
      response.status(200).json({
        message: "success",
        request: {
          type: "POST",
          url: "http://localhost:3000/products",
          body: { name: "String", price: "Number" },
        },
      });
    })
    .catch((error) => {
      response.status(500).json({ error: error });
    });
});

module.exports = router;
