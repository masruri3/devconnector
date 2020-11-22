const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const User = require("../../models/Users");
const Profile = require("../../models/Profile");

//  @route  GET api/profile
//  @desc   Test route
//  @access Public
router.get("/", (req, res) => {
  res.send("profile route");
});

//  @route  GET api/profile/me
//  @desc Get current users profile
//  @access Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
