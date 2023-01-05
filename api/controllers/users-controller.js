const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((doc) => {
      if (doc.length >= 1) {
        return res.status(409).json({
          message: "email is registered before",
        });
      }

      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({
            error: err.message,
          });
        }

        const user = new User({
          _id: new mongoose.Types.ObjectId(),
          email: req.body.email,
          password: hash,
        });

        user
          .save()
          .then((doc) => {
            res.status(201).json({
              message: "success",
              user: {
                _id: doc._id,
                email: doc.email,
              },
            });
          })
          .catch((err) => {
            res.status(500).json(err.message);
          });
      });
    });
};

exports.login = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((users) => {
      console.log(users);
      if (users.length < 1) {
        return res.status(401).json({
          message: "user does not exist",
        });
      }

      bcrypt.compare(req.body.password, users[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed",
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: users[0].email,
              userId: users[0]._id,
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h",
            }
          );

          return res.status(200).json({
            message: "successfully logedin to the api",
            token: token,
          });
        }

        res.status(500).json({ message: "incorrect password" });
      });
    });
};

exports.getAll = (req, res, next) => {
  User.find()
    .select("_id email")
    .exec()
    .then((docs) => {
      if (docs.length === 0) {
        return res.status(404).json({
          message: "no users found",
        });
      }
      res.status(200).json({
        count: docs.length,
        users: docs,
      });
    })
    .catch((err) => {
      res.status(200).json(err);
    });
};

exports.getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .select("_id email")
    .exec()
    .then((doc) => {
      if (!doc) {
        return res.status(404).json({
          message: "user not found",
        });
      }
      res.status(200).json({
        user: doc,
      });
    })
    .catch((err) => {
      res.status(200).json(err);
    });
};

exports.delete = (req, res, next) => {
  User.remove({ _id: req.params.userId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "user removed",
      });
    })
    .catch((err) => {
      res.status(200).json({
        err,
      });
    });
};

exports.clear = (req, res, next) => {
  User.remove()
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "users cleared out",
      });
    })
    .catch((err) => {
      res.status(200).json({
        err,
      });
    });
};
