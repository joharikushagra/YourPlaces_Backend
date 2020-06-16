const express = require("express");
const router = express.Router();
const HttpError = require("../models/http-error");
const { check } = require("express-validator");

const userControllers = require("../controllers/user-controllers");
const fileUpload = require("../middleware/file-upload");

router.get("/", userControllers.getUsers);

router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email")
      .normalizeEmail() //Test@test.com => test@rtest.com
      .isEmail(),
    check("password").isLength(6),
  ],
  userControllers.signup
);

router.post("/login", userControllers.login);

module.exports = router;
