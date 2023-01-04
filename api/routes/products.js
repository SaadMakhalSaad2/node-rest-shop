const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const mongoose = require("mongoose");
const multer = require("multer");

const storageSettings = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null, "uploads/products");
  },
  filename: function (request, file, callback) {
    callback(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({
  storage: storageSettings,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

router.get("/", (request, response, next) => {
  Product.find()
    .select("name price _id productImage")
    .exec()
    .then((docs) => {
      const res = {
        count: docs.length,
        products: docs.map((doc) => {
          return {
            name: doc.name,
            price: doc.price,
            _id: doc._id,
            productImage: {
              type: "GET",
              url: process.env.HOST + "products/uploads" + doc.imagePath,
            },
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

router.get("/uploads/:imagePath", (request, response, next) => {
  console.log("requested file path: " + request.params.imagePath);
  var options = {
    root: "./uploads/products",
  };

  var fileName = request.params.imagePath;
  response.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log("Sent:", fileName);
    }
  });
});

router.post("/", upload.single("productImage"), (request, response, next) => {
  console.log(request.file);
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: request.body.name,
    price: request.body.price,
    productImage: request.file.filename,
  });

  product
    .save()
    .then((result) => {
      console.log("saved: " + result);
      response.status(201).json({
        message: "success",
        createdProduct: {
          name: result.name,
          _id: result._id,
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
    .select("name price _id productImage")
    .exec()
    .then((doc) => {
      response.status(200).json({
        product: doc,
        productImage: {
          type: "GET",
          url: process.env.HOST + "products/uploads/" + doc.productImage,
        },
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
