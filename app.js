if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const reviewRouter = require("./routes/review.js");
const listingRouter = require("./routes/listing.js");
const userRouter = require("./routes/user.js");

//--------------------------------------  
// DATABASE CONNECTION
//--------------------------------------

const dbUrl = process.env.ATLAS_DB_URL || "mongodb://127.0.0.1:27017/wanderlust";

// Try connecting with exponential backoff to tolerate transient DNS/network issues
connectWithRetry(5).then(() => console.log('connected to DB')).catch((err) => {
  console.error('Failed to establish DB connection after retries:', err);
  process.exit(1);
});

async function connectWithRetry(attemptsLeft, delayMs = 1000) {
  try {
    await mongoose.connect(dbUrl);
    return;
  } catch (err) {
    console.warn(`DB connection failed. Attempts left: ${attemptsLeft - 1}. Error: ${err.code || err.message}`);
    if (attemptsLeft <= 1) throw err;
    // wait and retry with exponential backoff
    await new Promise((res) => setTimeout(res, delayMs));
    return connectWithRetry(attemptsLeft - 1, Math.min(delayMs * 2, 30000));
  }
}

//--------------------------------------
// MIDDLEWARE & CONFIGURATION
//--------------------------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

//------------------------------------------------------
// SESSION STORE (Critical Fix: crypto.secret MATCHING)
//------------------------------------------------------
const secret = process.env.SECRET || "thisshouldbeabettersecret!";

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: secret
  },
  touchAfter: 24 * 60 * 60 // reduce unnecessary writes
});

store.on("error", (e) => {
  console.log("SESSION STORE ERROR", e);
});

const sessionOptions = {
  store,
  secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  }
};

//--------------------------------------
// Load MapToken for all views
//--------------------------------------
app.use((req, res, next) => {
  res.locals.mapToken = process.env.MAP_TOKEN;
  next();
});

//--------------------------------------
// SESSION + FLASH
//--------------------------------------
app.use(session(sessionOptions));
app.use(flash());

//--------------------------------------
// PASSPORT AUTH
//--------------------------------------
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//--------------------------------------
// GLOBAL TEMPLATE VARIABLES
//--------------------------------------
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

//--------------------------------------
// ROUTES
//--------------------------------------
app.get("/", (req, res) => {
  res.send("/listings");
});
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


//--------------------------------------
// 404 HANDLER
//--------------------------------------
app.use((req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

//--------------------------------------
// GLOBAL ERROR HANDLER
//--------------------------------------
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

//--------------------------------------
// SERVER
//--------------------------------------
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});