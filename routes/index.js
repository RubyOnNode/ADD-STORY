const express = require("express");
const router = express.Router();
const { ensureAuth, ensureGuest } = require("../midlleware/auth");
const Story = require("../models/Story");
const { formatDate } = require("../helpers/ejs");

router.get("/", ensureGuest, (req, res) => {
  res.render("login", { layout: "./layouts/login-layout" });
});

router.get("/dashboard", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ user: req.user.id }).lean();

    res.render("dashboard", {
      name: req.user.firstName,
      stories,
      formatDate,
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

module.exports = router;
