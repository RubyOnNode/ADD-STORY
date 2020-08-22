const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const morgan = require("morgan");
const path = require("path");
const methodOverride = require("method-override");
const passport = require("passport");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");
const MongoStore = require("connect-mongo")(session);
//Load config
dotenv.config({ path: "./config/config.env" });

connectDB();
require("./config/passport")(passport);

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

app.set("view engine", "ejs");
app.set("layout", "layouts/layout");
app.use(expressLayouts);

//session middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "public")));

if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}

app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));
app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "favicon.ico"), (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
});

app.use(function (req, res, next) {
  res.render("error/404");
  next();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
