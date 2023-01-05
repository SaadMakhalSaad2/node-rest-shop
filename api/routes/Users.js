const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const usersCtrl = require("../controllers/users-controller");

router.post("/signup", usersCtrl.signup);

router.post("/login", usersCtrl.login);

router.get("/", usersCtrl.getAll);

router.get("/:userId", usersCtrl.getUser);

router.delete("/:userId", usersCtrl.delete);

router.delete("/", checkAuth, usersCtrl.clear);

module.exports = router;
