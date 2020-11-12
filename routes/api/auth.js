const bcrypt = require("bcryptjs");
const config = require("config");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const auth = require("../../middleware/auth");
const User = require("../../models/Users");

//  @route  POST api/auth
//  @desc   Login user & get token
//  @access Public
router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check is user exist
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credential" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credential" }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      // Return jsonwebtoken
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

      // console.log(req.body);
      // res.send("User Registered");
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server error");
    }
  }
);

//  @route  GET api/auth
//  @desc   Test route
//  @access Public
router.get("/", auth, async (req, res) => {
  // res.send("Auth route");
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
