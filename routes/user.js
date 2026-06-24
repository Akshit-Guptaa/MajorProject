const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const rateLimit = require("express-rate-limit");

const userController = require("../controllers/users.js");

// Rate limit auth routes — max 10 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many attempts, please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

router.route("/signup")
.get( userController.renderSignupForm)
.post( wrapAsync(userController.signup));

router.route("/login")
.get( userController.renderLoginForm)
.post( saveRedirectUrl,
    passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
}),
userController.login);


router.route("/favorites")
    .get(isLoggedIn, wrapAsync(userController.renderFavorites));

router.post("/favorites/:id", isLoggedIn, wrapAsync(userController.toggleFavorite));

router.get("/logout", userController.logout);

module.exports = router;