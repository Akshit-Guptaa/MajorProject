const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs")
};

module.exports.signup = async (req, res, next) => {
    try{
    let {username, email, password} = req.body;
    const newUser = new User({email, username});
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "Welcome to TravelBug!!");
        req.session.save((err) => {
            if (err) return next(err);
            res.redirect("/listings");
        });
    });
    } catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async(req, res, next) => {
    req.flash("success", "Welcome back to TravelBug!!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    req.session.save((err) => {
        if (err) {
            return next(err);
        }
        res.redirect(redirectUrl);
    });
};

module.exports.logout =  (req, res, next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    });
};

module.exports.toggleFavorite = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Please log in first" });
        }
        const { id } = req.params;
        const user = await User.findById(req.user._id);
        
        if (user.favorites.some(favId => favId.toString() === id.toString())) {
            await User.findByIdAndUpdate(req.user._id, { $pull: { favorites: id } });
            res.json({ success: true, isFavorite: false });
        } else {
            await User.findByIdAndUpdate(req.user._id, { $addToSet: { favorites: id } });
            res.json({ success: true, isFavorite: true });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: "Server error" });
    }
};

module.exports.renderFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('favorites');
        res.render("users/favorites.ejs", { allListings: user.favorites });
    } catch (e) {
        console.error(e);
        req.flash("error", "Error loading favorites");
        res.redirect("/listings");
    }
};