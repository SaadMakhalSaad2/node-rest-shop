const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");
const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://saadmankarious:" +
      process.env.MONGO_ATLAS_PASSWORD +
      "@cluster0.6m9yjr7.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => console.log("connected to db"))
  .catch((error) => console.log("connection failed: " + error));

app.use((request, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "*");
  if (request.method === "OPTIONS") {
    response.header(
      "Access-Control-Allow-Methods",
      "PUT, POST, PATCH, DELETE, GET"
    );
    return response.status(200).json();
  }
  next();
});

mongoose.Promise = global.Promise;

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

app.use((request, response, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, request, response, next) => {
  response.status(error.status || 500);
  response.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
