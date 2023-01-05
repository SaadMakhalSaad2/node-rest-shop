const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const productsCtrl = require("../controllers/products-controller");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");

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

router.get("/", productsCtrl.getAllProducts);

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

router.post(
  "/",
  checkAuth,
  upload.single("productImage"),
  productsCtrl.newProduct
);

router.get("/:productId", productsCtrl.getProduct);

router.patch("/:productId", checkAuth, productsCtrl.updateProduct);

router.delete("/:productId", checkAuth, productsCtrl.delete);

module.exports = router;
