
require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path  = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");
const aiRouter = require("./routes/ai.js");

const dbUrl = process.env.ATLASDB_URL;

const events = require("events");
events.EventEmitter.defaultMaxListeners = 15;

main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
    await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 10000,
    });
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.query) mongoSanitize.sanitize(req.query);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("Error in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
};


app.get("/", (req, res) => {
    res.redirect("/listings");
});



app.use(session(sessionOptions));
app.use(flash());
 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get("/demouser", async(req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "Stud"
//   });

//   let registeredUser = await User.register(fakeUser, "helloworld");
//   res.send(registeredUser);
// })

app.use((req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.log('Session ID:', req.sessionID);
    console.log('Session Passport:', req.session.passport);
    console.log('Req User:', req.user);
  }
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null;
  res.locals.currPath = req.originalUrl;
  next();
});


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/api/ai", aiRouter);

app.get("/api/session-test", (req, res) => {
  res.json({
    sessionID: req.sessionID,
    user: req.user,
    localsCurrUser: res.locals.currUser,
    isCurrUserTruthy: !!res.locals.currUser,
    passport: req.session.passport,
    flashSuccess: res.locals.success
  });
});

app.get("/test-curr-user", (req, res) => {
  res.send(`<p>locals.currUser: ${JSON.stringify(res.locals.currUser)}</p><p>currUser: ${JSON.stringify(res.locals.currUser)}</p>`);
});

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let {statusCode=500, message="Something went wrong!"} = err;
  res.status(statusCode).render("error.ejs", {message});
  // res.status(statusCode).send(message);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`server is listening to port ${port}`);
});